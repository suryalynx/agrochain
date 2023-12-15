App = {
    loading: false,
    web3Provider: null,
    contracts: {},
    account: null,

    load: async function () {
        await this.loadWeb3();
        await this.loadAccount();
        await this.loadContract();
        await this.loadProductDetails();
    },

    loadWeb3: async function () {
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            window.web3 = new Web3(window.ethereum);
            try {
                // Meminta izin akses ke akun Ethereum pengguna
                await window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (error) {
                // Tangani kesalahan jika pengguna menolak akses
                console.error('Access to Ethereum account denied:', error);
            }
        } else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            console.error('No web3 provider detected. Please install MetaMask.');
        }
    },
    

    loadAccount: async () => {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        App.account = accounts[0];
    },

    loadContract: async function () {
        try {
            // Load contract JSON file (Replace 'YourContract.json' with your actual contract JSON file)
            const response = await fetch('SupplyChain.json');
            const contractJSON = await response.json();
    
            // Initialize the contract instance
            const contractABI = contractJSON.abi;
            const networkId = await window.web3.eth.net.getId(); // Get the current network ID
            const deployedNetwork = contractJSON.networks[networkId];
            const contractAddress = deployedNetwork.address;
    
            // Create a contract instance
            this.contracts.SupplyChain = new window.web3.eth.Contract(contractABI, contractAddress);
            this.SupplyChain = this.contracts.SupplyChain;
    
        } catch (error) {
            console.error("Error loading contract:", error);
            // Handle error loading contract
        }
    },
    
    
    addProduct: async function () {
        const productType = document.getElementById("productType").value;
        const status = document.getElementById("status").value;
        const location = document.getElementById("location").value;

        const accounts = await ethereum.request({ method: 'eth_accounts' });
        const account = accounts[0];

        try {
            // Panggil fungsi addProduct dari kontrak SupplyChain
            const result = await App.SupplyChain.methods.addProduct(productType, status, location).send({ from: account });
            console.log("Product Added:", result);
            await App.updateProductTable();
            // Lakukan sesuatu setelah menambahkan produk (misalnya, perbarui UI, tampilkan pesan sukses)
        } catch (error) {
            console.error("Error Adding Product:", error);
            // Tangani kesalahan saat menambahkan produk
        }
    },

    getProduct: async () => {
        const productId = document.getElementById("productId").value;

        try {
            const product = await App.SupplyChain.products(productId).call(); // Menggunakan 'call()' untuk memanggil fungsi view di Solidity
            console.log("Product Details:", product);
            // Tampilkan detail produk (mis. memperbarui UI)
        } catch (error) {
            console.error("Error Fetching Product:", error);
            // Tangani kesalahan saat mengambil detail produk
        }
    },
    
        updateProductTable: async () => {
        try {
            // Accessing products from App object contracts
            const productCount = await App.contracts.SupplyChain.methods.productCount().call();
            const tableBody = $('#productTableBody');
            tableBody.empty(); // Clear existing table content
    
            for (let i = 1; i <= productCount; i++) {
                const product = await App.contracts.SupplyChain.methods.products(i).call();
    
                tableBody.append(`
                    <tr>
                        <td>${product.productId}</td>
                        <td>${product.productType}</td>
                        <td>${new Date(product.productionDate * 1000)}</td>
                        <td>${product.producer}</td>
                        <td>${product.status}</td>
                        <td>${product.location}</td>
                    </tr>
                `);
            }
        } catch (error) {
            console.error("Error updating product table:", error);
        }
    },    
        loadProductDetails: async () => {
        // Mengosongkan konten produk terkini
        $("#productDetails").empty();
    
        // Mendapatkan jumlah produk
        const totalProducts = await App.SupplyChain.productCount();
    
        // Memuat dan menampilkan detail setiap produk
        for (let i = 1; i <= totalProducts; i++) {
            const product = await App.SupplyChain.products(i);
            const productId = product[0];
            const productType = product[1];
            const productionDate = new Date(product[2] * 1000);
            const producer = product[3];
            const status = product[4];
            const location = product[5];
    
            // Membuat template untuk setiap produk
            const productTemplate = `
                <div class="product">
                    <h3>Product ID: ${productId}</h3>
                    <p>Type: ${productType}</p>
                    <p>Production Date: ${productionDate}</p>
                    <p>Producer: ${producer}</p>
                    <p>Status: ${status}</p>
                    <p>Location: ${location}</p>
                </div>
                <hr>
            `;
    
            // Menambahkan produk ke dalam container produk
            $("#productDetails").append(productTemplate);
        }
    },
}
$(document).ready(function () {
    App.load();
    window.ethereum.on('accountsChanged', function (accounts) {
        App.account = accounts[0];
        window.location.reload();
    });
});

