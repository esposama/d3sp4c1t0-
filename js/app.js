App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  buildApiRequest: function(){
    'GET',
    '/youtube/v3/videos', 
    {'id': 'Ks-_Mh1QhMc',
    'part': 'statistics.viewCount'};
  }, 

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('DespacitoCoin.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var DespacitoCoinArtifact = data;
      App.contracts.DespacitoCoin = TruffleContract(DespacitoCoinArtifact);

      // Set the provider for our contract.
      App.contracts.DespacitoCoin.setProvider(App.web3Provider);

      // Use our contract to retieve and mark the adopted pets.
      return App.getBalances();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#transferButton', App.handleTransfer);
    $(document).on('click', '#uploadButton', App.handleLoad);
  },

  handleTransfer: function(event) {
    event.preventDefault();

    var amount = parseInt($('#DPCTransferAmount').val());
    var toAddress = $('#DPCTransferAddress').val();

    console.log('Transfer ' + amount + ' DPC to ' + toAddress);

    var DespacitoCoinInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.DespacitoCoin.deployed().then(function(instance) {
        DespacitoCoinInstance = instance;

        return DespacitoCoinInstance.transfer(toAddress, amount, {from: account});
      }).then(function(result) {
        alert('Transfer Successful!');
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  parseLink: function(){
     ("{https://www.googleapis.com/youtube/v3/videos?id={video-id}&key={API-key}%20&fields=items(statistics)&part=statistics", function(data){
    $("#results").append('<p>' + data.items[0].statistics.viewCount + '</p>');
    });
  }, 

  //Upload the data 
  handleLoad: function(event) {
    event.preventDefault();

    console.log("Handling a big load")
    
    //App.buildApiRequest(); 
    //var URL = "https://www.googleapis.com/youtube/v3/videos?id={video-id}&key={API-key}%20&fields=items(statistics)&part=statistics"
    // var getDPSong = $('#DPSong')[0];

    var load = $('#DPCUploadLoad').val();
    var loadHash = sha256(load);
    console.log(loadHash)

    console.log('Uploading ' + load + ' to Despacito');

    var DespacitoCoinInstance;

    // getaudio.load(); 
    // getaudio.play(); 

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.DespacitoCoin.deployed().then(function(instance) {
        DespacitoCoinInstance = instance;

        return DespacitoCoinInstance.upload(loadHash, {from: account});
      }).then(function(result) {
        alert('Upload Successful!');
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getBalances: function() {
    console.log('Getting balances...');

    var DespacitoCoinInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.DespacitoCoin.deployed().then(function(instance) {
        DespacitoCoinInstance = instance;

        return DespacitoCoinInstance.balanceOf(account);
      }).then(function(result) {
        balance = result.c[0];

        $('#DPCBalance').text(balance);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
