const OrderBookieFactoryABI = 
[
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "settlementManagerAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "orderBookieAddress",
        "type": "address"
      }
    ],
    "name": "OrderBookieCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "ancillaryData",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "startDate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "proposerReward",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "proposerBond",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "livenessTime",
        "type": "uint64"
      },
      {
        "internalType": "address",
        "name": "ooCurrency",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "acceptedToken",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "priceIdentifier",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "addAsCallback",
        "type": "bool"
      }
    ],
    "name": "createOrderBookie",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "eventID",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getOrderBookies",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "settlementManager",
    "outputs": [
      {
        "internalType": "contract SettlementManager",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export default OrderBookieFactoryABI;
