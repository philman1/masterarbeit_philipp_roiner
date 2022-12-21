# masterarbeit_philipp_roiner

This work proposed a blockchain-based approach to enable the security and licensing of copyrighted images using smart contracts.
The architecture of the developed prototype Picense is composed of three components.
The focus is on the Solana blockchain, which stores, modifies and provides the most important data through smart contracts.
In addition, a backend server is responsible for encrypting or decrypting images and storing them on the IPFS.
A front-end application grants users access to the application through various interaction options.
In this way, images can be newly entered, offers and licenses can be created and viewed, or licensed images can be downloaded.

## Structur
The following structure summarizes the main areas of the project.

    .
    ├── ...
    ├── app                               # Frontend
    │   ├── public              
    │   ├── src              
    │   │   ├── api                       # Communication with the blockchain
    │   │   ├── assets                    # Images and Icons
    │   │   ├── components                # Vue.js components
    │   │   ├── composables               # Workspace and helper functions
    │   │   ├── models                    # Model classes
    │   │   ├── App.vue                   # Vue-App root
    │   │   ├── idl.json                  # Program Id and Ix structure
    │   │   ├── routes.js                 # Vue-Router routes
    │   │   ├── store.js                  # Vuex store
    │   │   └── ...
    │   ├── package.json            
    │   └── ...                 
    ├── programs
    │   ├── masterarbeit_philipp_roiner              
    │   │   ├── src
    │   │   │   ├── instructions          # Accounts structs and Ix
    │   │   │   ├── state                 # Accounts
    │   │   │   ├── lib.rs                # Program entry point
    │   │   ├── └── ...
    │   └── └── ...
    ├── server
    │   ├── controller                    # Node.js controller
    │   ├── db                            # SQLite DB
    │   ├── middleware                    # Middlewares (e. g. web3Auth)
    │   ├── idl.json                      # Program Id and Ix structure
    │   ├── index.js
    │   ├── routes.js                     # API routes
    │   ├── package.json
    │   └── ...
    └── ...
    
