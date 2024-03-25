const OrderBookieABI = 
[
  {
    "inputs": [],
    "name": "cancelBookie",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "collectAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "getBets",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "betID",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "int256",
            "name": "prediction",
            "type": "int256"
          },
          {
            "internalType": "uint256",
            "name": "odd",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountUsed",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "toWin",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "toWinFilled",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "hasCollectedPayout",
            "type": "bool"
          }
        ],
        "internalType": "struct Bet[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBettors",
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
    "name": "getBookieInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "eventID",
            "type": "bytes32"
          },
          {
            "internalType": "int256",
            "name": "outcome",
            "type": "int256"
          },
          {
            "internalType": "uint256",
            "name": "startDate",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isCanceled",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "factoryAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "settlementManagerAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "acceptedTokenAddress",
            "type": "address"
          }
        ],
        "internalType": "struct OrderBookieInfo",
        "name": "orderBookieInfo",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int256",
        "name": "prediction",
        "type": "int256"
      },
      {
        "internalType": "uint256",
        "name": "odd",
        "type": "uint256"
      }
    ],
    "name": "getLiquidityAtOdd",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "payoutAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int256",
        "name": "prediction",
        "type": "int256"
      },
      {
        "internalType": "uint256",
        "name": "wagerAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "odd",
        "type": "uint256"
      }
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "withdrawUnfilled",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export default OrderBookieABI;
