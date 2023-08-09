export type Growth = {
    "version": "0.1.0",
    "name": "growth",
    "instructions": [
      {
        "name": "createOrganization",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "org",
            "isMut": true,
            "isSigner": false,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "type": "string",
                  "value": "org"
                },
                {
                  "kind": "account",
                  "type": "publicKey",
                  "account": "Mint",
                  "path": "org_mint"
                }
              ]
            }
          },
          {
            "name": "orgMint",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "associatedTokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenMetadataProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "metadata",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "masterEdition",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenAccount",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "weights",
            "type": {
              "vec": "f32"
            }
          },
          {
            "name": "ranges",
            "type": "bytes"
          }
        ]
      },
      {
        "name": "register",
        "accounts": [
          {
            "name": "applicant",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "org",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "score",
            "isMut": true,
            "isSigner": false,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "type": "string",
                  "value": "score"
                },
                {
                  "kind": "account",
                  "type": "publicKey",
                  "account": "Org",
                  "path": "org"
                },
                {
                  "kind": "account",
                  "type": "publicKey",
                  "path": "applicant"
                }
              ]
            }
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "orgMint",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "registerMint",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenMetadataProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "metadata",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "collectionMaster",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": []
      },
      {
        "name": "verify",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "tokenMetadataProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "org",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "orgMint",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "collectionMaster",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "collectionMetadata",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "metadata",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": []
      },
      {
        "name": "submitScore",
        "accounts": [
          {
            "name": "applicant",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "orgMint",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "score",
            "isMut": true,
            "isSigner": false,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "type": "string",
                  "value": "score"
                },
                {
                  "kind": "account",
                  "type": "publicKey",
                  "account": "Org",
                  "path": "org"
                },
                {
                  "kind": "account",
                  "type": "publicKey",
                  "path": "applicant"
                }
              ]
            }
          },
          {
            "name": "org",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenMetadataProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "metadata",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "scores",
            "type": {
              "vec": "f32"
            }
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "score",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "scores",
              "type": {
                "vec": "f32"
              }
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "org",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "weights",
              "type": {
                "vec": "f32"
              }
            },
            {
              "name": "ranges",
              "type": "bytes"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      }
    ]
  };
  
  export const IDL: Growth = {
    "version": "0.1.0",
    "name": "growth",
    "instructions": [
      {
        "name": "createOrganization",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "org",
            "isMut": true,
            "isSigner": false,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "type": "string",
                  "value": "org"
                },
                {
                  "kind": "account",
                  "type": "publicKey",
                  "account": "Mint",
                  "path": "org_mint"
                }
              ]
            }
          },
          {
            "name": "orgMint",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "associatedTokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenMetadataProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "metadata",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "masterEdition",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenAccount",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "weights",
            "type": {
              "vec": "f32"
            }
          },
          {
            "name": "ranges",
            "type": "bytes"
          }
        ]
      },
      {
        "name": "register",
        "accounts": [
          {
            "name": "applicant",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "org",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "score",
            "isMut": true,
            "isSigner": false,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "type": "string",
                  "value": "score"
                },
                {
                  "kind": "account",
                  "type": "publicKey",
                  "account": "Org",
                  "path": "org"
                },
                {
                  "kind": "account",
                  "type": "publicKey",
                  "path": "applicant"
                }
              ]
            }
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "orgMint",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "registerMint",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenMetadataProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "metadata",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "collectionMaster",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": []
      },
      {
        "name": "verify",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "tokenMetadataProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "org",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "orgMint",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "collectionMaster",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "collectionMetadata",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "metadata",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": []
      },
      {
        "name": "submitScore",
        "accounts": [
          {
            "name": "applicant",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "orgMint",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "score",
            "isMut": true,
            "isSigner": false,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "type": "string",
                  "value": "score"
                },
                {
                  "kind": "account",
                  "type": "publicKey",
                  "account": "Org",
                  "path": "org"
                },
                {
                  "kind": "account",
                  "type": "publicKey",
                  "path": "applicant"
                }
              ]
            }
          },
          {
            "name": "org",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenMetadataProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "metadata",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "scores",
            "type": {
              "vec": "f32"
            }
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "score",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "scores",
              "type": {
                "vec": "f32"
              }
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "org",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "weights",
              "type": {
                "vec": "f32"
              }
            },
            {
              "name": "ranges",
              "type": "bytes"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      }
    ]
  };
  