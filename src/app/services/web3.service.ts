// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ethers } from 'ethers';
import { ToastrService } from 'ngx-toastr';
import ValueStorageContract from '../../../build/contracts/ValueStorage.json';

// Definición de la interfaz para los registros del historial
export interface ValueRecord {
  value: string;
  timestamp: number; // Los timestamps de Solidity (uint256) se manejan como numbers en JS/TS
}

export interface NetworkStatus {
  isConnected: boolean;
  network: string;
  chainId: number;
  isCorrectNetwork: boolean;
}

export interface WalletInfo {
  address: string;
  balance: string;
  isAuthorized: boolean;
  isOwner: boolean; // Nuevo campo para saber si es owner
}

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private readonly GANACHE_CHAIN_ID = 1337;
  private readonly SEPOLIA_CHAIN_ID = 11155111;
  
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  
  private networkStatusSubject = new BehaviorSubject<NetworkStatus>({
    isConnected: false,
    network: 'Not connected',
    chainId: 0,
    isCorrectNetwork: false
  });
  
  private walletSubject = new BehaviorSubject<WalletInfo | null>(null);
  private currentValueSubject = new BehaviorSubject<string>('');
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  
  networkStatus$ = this.networkStatusSubject.asObservable();
  wallet$ = this.walletSubject.asObservable();
  currentValue$ = this.currentValueSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();
  
  constructor(private toastr: ToastrService) {
    this.initializeWeb3();
  }
  
  async initializeWeb3(): Promise<void> {

    console.log('Web3Service: initializeWeb3 called'); // <--- NUEVO LOG
    if (window.ethereum) {
      try {
        // Create provider
        this.provider = new ethers.BrowserProvider(window.ethereum);
        
        // Setup event listeners
        window.ethereum.on('chainChanged', () => window.location.reload());
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            this.resetState();
          } else {
            this.connectWallet();
          }
        });
        
        // Check if already connected
        console.log('Web3Service: Checking for existing accounts...'); // <--- NUEVO LOG
        const accounts = await this.provider.listAccounts();
        console.log('Web3Service: Accounts found:', accounts); // <--- NUEVO LOG
        if (accounts.length > 0) {
          console.log('Web3Service: Attempting to connect wallet automatically...'); // <--- NUEVO LOG
          await this.connectWallet();
        }
        
        // Update network status
        await this.updateNetworkStatus();
      } catch (error) {
        console.error('Error initializing Web3:', error);
        this.toastr.error('Error al inicializar Web3. Por favor, revisa tu MetaMask.', 'Error de Web3');
      }
    } else {
      this.toastr.warning('MetaMask no está instalado. Por favor, instala MetaMask para usar esta DApp.', 'MetaMask Requerido');
    }
  }
  
  async connectWallet(): Promise<boolean> {
    console.log('Web3Service: connectWallet method called'); // <--- NUEVO LOG
    if (!this.provider) {
      this.toastr.error('Proveedor Web3 no inicializado', 'Error de Conexión');
      return false;
    }
    
    this.isLoadingSubject.next(true);
    
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get signer and address
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      
      // Get network status
      await this.updateNetworkStatus();
      
      // Get balance
      const balance = await this.provider.getBalance(address);
      const etherBalance = ethers.formatEther(balance);
      
      // Initialize contract
      await this.initializeContract();
      
      // Check if user is authorized y si es owner
      let calculatedIsAuthorized = false;
      let isOwner = false;
      if (this.contract) {
        const contractOwnerAddress = await this.contract['getOwner']();
        console.log('Web3Service: Connected account address:', address);
        console.log('Web3Service: Contract owner address:', contractOwnerAddress);
        
        isOwner = contractOwnerAddress.toLowerCase() === address.toLowerCase();
        console.log('Web3Service: Is connected account owner?', isOwner);
        
        if (isOwner) {
          calculatedIsAuthorized = true; // Owner is always authorized
        } else {
          calculatedIsAuthorized = await this.contract['isAuthorized'](address);
        }
        console.log('Web3Service: Calculated isAuthorized:', calculatedIsAuthorized);
      }
      
      // Update wallet info
      this.walletSubject.next({
        address,
        balance: parseFloat(etherBalance).toFixed(4),
        isAuthorized: calculatedIsAuthorized, 
        isOwner
      });

      // Obtener el valor actual después de conectar la billetera y configurar el contrato
      await this.getCurrentValue();
      
      this.toastr.success('Billetera conectada exitosamente', 'Conectado');
      this.isLoadingSubject.next(false);
      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      this.toastr.error('Error al conectar la billetera', 'Error de Conexión');
      this.isLoadingSubject.next(false);
      return false;
    }
  }
  
  private async updateNetworkStatus(): Promise<void> {
    if (!this.provider) return;
    
    try {
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);
      
      const isCorrectNetwork = 
        chainId === this.GANACHE_CHAIN_ID || 
        chainId === this.SEPOLIA_CHAIN_ID;
      
      this.networkStatusSubject.next({
        isConnected: true,
        network: this.getNetworkName(chainId),
        chainId,
        isCorrectNetwork
      });
      
      if (!isCorrectNetwork) {
        this.toastr.warning(
          'Por favor, conéctate a Ganache (localhost:7545) o a la red Sepolia.',
          'Red Incorrecta'
        );
      }
    } catch (error) {
      console.error('Error updating network status:', error);
      this.networkStatusSubject.next({
        isConnected: false,
        network: 'Unknown',
        chainId: 0,
        isCorrectNetwork: false
      });
    }
  }
  
  private getNetworkName(chainId: number): string {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case this.SEPOLIA_CHAIN_ID: return 'Sepolia Testnet';
      case this.GANACHE_CHAIN_ID: return 'Ganache Local';
      default: return `Red Desconocida (${chainId})`;
    }
  }
  
  private async initializeContract(): Promise<void> {
    console.log('Web3Service: initializeContract called'); // <--- NUEVO LOG
    if (!this.signer) {
      console.log('Web3Service: initializeContract - No signer found, returning.'); // <--- NUEVO LOG
      return;
    }

    try {
      const network = await this.provider?.getNetwork();
      const networkId = network ? String(network.chainId) : '1337'; // Default to Ganache
      console.log('Web3Service: initializeContract - networkId:', networkId); // <--- NUEVO LOG

      const networks = ValueStorageContract.networks as Record<string, {
        address: string;
        transactionHash: string;
        events: object;
        links: object;
      }>;
      console.log('Web3Service: initializeContract - ValueStorageContract.networks:', JSON.stringify(networks)); // <--- NUEVO LOG (stringify para mejor lectura)

      const deployedNetwork = networks[networkId];
      console.log('Web3Service: initializeContract - deployedNetwork for networkId ' + networkId + ':', deployedNetwork ? JSON.stringify(deployedNetwork) : 'NOT FOUND'); // <--- NUEVO LOG

      if (!deployedNetwork) {
        this.toastr.error('Contrato no desplegado en la red actual.', 'Error de Contrato');
        console.error('Web3Service: initializeContract - Contract not deployed on networkId:', networkId); // <--- NUEVO LOG
        return;
      }

      this.contract = new ethers.Contract(
        deployedNetwork.address,
        ValueStorageContract.abi,
        this.signer
      );
      console.log('Web3Service: initializeContract - Contract initialized successfully'); // <--- NUEVO LOG

      // Setup event listener for ValueUpdated
      this.contract.on('ValueUpdated', (user, newValue, timestamp) => {
        // Log detallado del evento recibido
        console.log('EVENT ValueUpdated RECEIVED:', { 
          user: user.toString(), 
          newValue: newValue.toString(), // Asegurarse de que es string para el log y el subject
          timestamp: timestamp.toString() 
        });
        this.toastr.info(`Valor actualizado a: ${newValue.toString()}`, 'Valor Actualizado');
        this.currentValueSubject.next(newValue.toString()); // Usar newValue.toString() por seguridad
      });

    } catch (error) {
      console.error('Error initializing contract:', error);
      this.toastr.error('Error al inicializar el contrato', 'Error de Contrato');
    }
  }

  
  async getCurrentValue(): Promise<string> {
    if (!this.contract) {
      this.toastr.error('Contrato no inicializado', 'Error de Contrato');
      return '';
    }
    
    try {
      const value = await this.contract['getValue']();
      this.currentValueSubject.next(value);
      return value;
    } catch (error) {
      console.error('Error getting current value:', error);
      this.toastr.error('Error al obtener el valor actual', 'Error de Contrato');
      return '';
    }
  }
  
  async setValue(newValue: string): Promise<boolean> {
    if (!this.contract || !this.signer) {
      this.toastr.error('Contrato o billetera no inicializados', 'Error de Contrato');
      return false;
    }
    
    this.isLoadingSubject.next(true);
    
    try {
      // Validate value
      if (!newValue || newValue.trim() === '') {
        this.toastr.error('El valor no puede estar vacío', 'Error de Validación');
        this.isLoadingSubject.next(false);
        return false;
      }
      
      // Get wallet
      const wallet = this.walletSubject.getValue();
      if (!wallet) {
        this.toastr.error('Billetera no conectada', 'Error de Conexión');
        this.isLoadingSubject.next(false);
        return false;
      }
      
      // Check authorization
      if (!wallet.isAuthorized) {
        this.toastr.error('No estás autorizado para actualizar el valor', 'Error de Autorización');
        this.isLoadingSubject.next(false);
        return false;
      }
      
      // Update value
      const tx = await this.contract['setValue'](newValue);
      this.toastr.info(
        'Transacción enviada. Esperando confirmación...',
        'Transacción Pendiente'
      );
      
      // Wait for transaction to be mined
      await tx.wait();
      
      this.toastr.success('Valor actualizado exitosamente', 'Éxito');
      // Explicitly refresh the current value from the contract
      console.log('Web3Service: setValue successful, explicitly calling getCurrentValue()');
      await this.getCurrentValue(); 
      
      this.isLoadingSubject.next(false);
      return true;
    } catch (error) {
      console.error('Error setting value:', error);
      this.toastr.error('Error al actualizar el valor', 'Error de Transacción');
      this.isLoadingSubject.next(false);
      return false;
    }
  }
  
  async getUserHistory(address?: string): Promise<ValueRecord[]> { // <--- Tipo de retorno actualizado
    if (!this.contract) {
      this.toastr.error('Contrato no inicializado', 'Error de Contrato');
      return [];
    }
    
    try {
      const userAddress = address || (await this.walletSubject.getValue()?.address);
      if (!userAddress) {
        this.toastr.error('No se proporcionó dirección o la billetera no está conectada', 'Error de Conexión');
        return [];
      }
      
      const rawHistory = await this.contract["getUserHistory"](userAddress);
      // Modificación para el logging seguro de BigInt
      console.log('Raw history from contract:', JSON.stringify(rawHistory, (key, value) =>
        typeof value === 'bigint'
          ? value.toString() + 'n' // Añadir 'n' para indicar que era un BigInt
          : value
      )); 

      if (!Array.isArray(rawHistory)) {
        console.error('Expected an array from getUserHistory, got:', rawHistory);
        this.toastr.error('Formato de datos inesperado para el historial del usuario', 'Error de Contrato');
        return [];
      }

      const history: ValueRecord[] = rawHistory.map((record: any) => {
        const value = record.value !== undefined ? record.value : record[0];
        const timestamp = record.timestamp !== undefined ? record.timestamp : record[1];
        
        return {
          value: String(value),
          timestamp: Number(timestamp) 
        };
      });
      
      return history;
    } catch (error: any) { // Especificar 'any' para el tipo de error
      // Modificación para el logging seguro del objeto error
      console.error('Error getting user history. Message:', error.message);
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.data) {
        console.error('Error data (stringified safely):', JSON.stringify(error.data, (key, value) => typeof value === 'bigint' ? value.toString() + 'n' : value, 2));
      }
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
      // Para ver el objeto de error completo de forma segura si es necesario:
      // console.error('Full error object (stringified safely):', JSON.stringify(error, (key, value) => typeof value === 'bigint' ? value.toString() + 'n' : value, 2));

      let errorMessage = 'Error al obtener el historial del usuario';
      if (error && error.reason) { // Comprobar que error no sea null o undefined
        errorMessage += `: ${error.reason}`;
      } else if (error && error.message) {
        errorMessage += `: ${error.message}`;
      }
      // Adicionalmente, si es un error de RPC con data, intentar mostrarlo
      if (error && error.data && error.data.message) {
        errorMessage += ` (Detalle: ${error.data.message})`;
      }
      this.toastr.error(errorMessage, 'Error de Contrato');
      return [];
    }
  }
  
  async authorizeAddress(address: string): Promise<boolean> {
    if (!this.contract || !this.signer) {
      this.toastr.error('Contrato o billetera no inicializados', 'Error de Contrato');
      return false;
    }
    
    this.isLoadingSubject.next(true);
    
    try {
      // Validate address
      if (!ethers.isAddress(address)) {
        this.toastr.error('Dirección Ethereum inválida', 'Error de Validación');
        this.isLoadingSubject.next(false);
        return false;
      }
      
      // Authorize address
      const tx = await this.contract["authorizeAddress"](address);
      this.toastr.info(
        'Transacción enviada. Esperando confirmación...',
        'Transacción Pendiente'
      );
      
      // Wait for transaction to be mined
      await tx.wait();
      
      this.toastr.success(`Dirección ${address} autorizada exitosamente`, 'Éxito');
      this.isLoadingSubject.next(false);
      return true;
    } catch (error) {
      console.error('Error authorizing address:', error);
      this.toastr.error('Error al autorizar la dirección', 'Error de Transacción');
      this.isLoadingSubject.next(false);
      return false;
    }
  }
  
  async revokeAuthorization(address: string): Promise<boolean> {
    if (!this.contract || !this.signer) {
      this.toastr.error('Contrato o billetera no inicializados', 'Error de Contrato');
      return false;
    }
    
    this.isLoadingSubject.next(true);
    
    try {
      // Validate address
      if (!ethers.isAddress(address)) {
        this.toastr.error('Dirección Ethereum inválida', 'Error de Validación');
        this.isLoadingSubject.next(false);
        return false;
      }
      
      // Revoke authorization
      const tx = await this.contract["revokeAuthorization"](address);
      this.toastr.info(
        'Transacción enviada. Esperando confirmación...',
        'Transacción Pendiente'
      );
      
      // Wait for transaction to be mined
      await tx.wait();
      
      this.toastr.success(`Autorización revocada para ${address}`, 'Éxito');
      this.isLoadingSubject.next(false);
      return true;
    } catch (error) {
      console.error('Error revoking authorization:', error);
      this.toastr.error('Error al revocar la autorización', 'Error de Transacción');
      this.isLoadingSubject.next(false);
      return false;
    }
  }
  
  async getAuthorizedAddresses(): Promise<string[]> {
    if (!this.contract) {
      this.toastr.error('Contrato no inicializado', 'Error de Contrato');
      return [];
    }
    
    try {
      return await this.contract["getAuthorizedAddresses"]();
    } catch (error) {
      console.error('Error getting authorized addresses:', error);
      this.toastr.error('Error al obtener las direcciones autorizadas', 'Error de Contrato');
      return [];
    }
  }
  
  async getContractOwner(): Promise<string> {
    if (!this.contract) {
      this.toastr.error('Contrato no inicializado', 'Error de Contrato');
      return '';
    }
    
    try {
      // Cambiado de "owner" a "getOwner" para llamar correctamente la función pública del contrato
      return await this.contract["getOwner"]();
    } catch (error) {
      console.error('Error getting contract owner:', error);
      this.toastr.error('Error al obtener el propietario del contrato', 'Error de Contrato');
      return '';
    }
  }
  
  private resetState(): void {
    this.signer = null;
    this.contract = null;
    this.walletSubject.next(null);
    this.currentValueSubject.next('');
    this.networkStatusSubject.next({
      isConnected: false,
      network: 'Not connected',
      chainId: 0,
      isCorrectNetwork: false
    });
  }
}