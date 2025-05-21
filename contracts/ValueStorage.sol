// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ValueStorage
 * @dev Almacena un valor y permite gestionarlo mediante direcciones autorizadas.
 * El owner puede autorizar o revocar direcciones. Se registra historial por usuario.
 */
contract ValueStorage {
    string private value;
    address private _owner;

    // Definición del struct para el historial
    struct ValueRecord {
        string value;
        uint256 timestamp;
    }

    mapping(address => bool) private authorized;
    mapping(address => bool) private inList;
    // Actualización del mapping de historial para usar el struct
    mapping(address => ValueRecord[]) private history;
    address[] private authorizedList;

    event ValueUpdated(address indexed user, string newValue, uint256 timestamp);
    event AddressAuthorized(address indexed user);
    event AuthorizationRevoked(address indexed user);

    modifier onlyOwner() {
        require(msg.sender == _owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(authorized[msg.sender], "Not authorized");
        _;
    }

    constructor() {
        _owner = msg.sender;
        authorized[msg.sender] = true;
        authorizedList.push(msg.sender);
        inList[msg.sender] = true;
        emit AddressAuthorized(msg.sender);
    }

    function setValue(string calldata newValue) external onlyAuthorized {
        require(bytes(newValue).length > 0, "Value cannot be empty");
        value = newValue;
        // Almacenar el struct en el historial
        history[msg.sender].push(ValueRecord(newValue, block.timestamp));
        emit ValueUpdated(msg.sender, newValue, block.timestamp);
    }

    function getValue() external view returns (string memory) {
        return value;
    }

    // Actualizar la función para devolver un array de ValueRecord
    function getUserHistory(address user) external view returns (ValueRecord[] memory) {
        return history[user];
    }

    function isAuthorized(address user) external view returns (bool) {
        return authorized[user];
    }

    function getOwner() external view returns (address) {
        return _owner;
    }

    function authorizeAddress(address user) external onlyOwner {
        require(user != address(0), "Invalid address");
        require(!authorized[user], "Already authorized");

        authorized[user] = true;
        if (!inList[user]) {
            authorizedList.push(user);
            inList[user] = true;
        }

        emit AddressAuthorized(user);
    }

    function revokeAuthorization(address user) external onlyOwner {
        require(user != _owner, "Cannot revoke owner's authorization");
        require(authorized[user], "Address not authorized");

        authorized[user] = false;
        emit AuthorizationRevoked(user);
    }

    function getAuthorizedAddresses() external view returns (address[] memory) {
        uint count = 0;
        for (uint i = 0; i < authorizedList.length; i++) {
            if (authorized[authorizedList[i]]) count++;
        }

        address[] memory result = new address[](count);
        uint index = 0;
        for (uint i = 0; i < authorizedList.length; i++) {
            if (authorized[authorizedList[i]]) {
                result[index++] = authorizedList[i];
            }
        }

        return result;
    }
}
