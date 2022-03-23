    // SPDX-License-Identifier: GPL-3.0

    pragma solidity ^0.8.0;

    contract RealEstateBid{

        //Blind bid construct
        struct Bid{
            address bidderAddress;
            bytes32 blindedBind;
            uint deposit;
        }

        //Revealed bid construct
        struct NakedBid{
            address bidderAddress;
            uint bid;
            uint deposit;
            bool valid;
        }

        address payable private _beneficiary;
        uint private _minBid;
        string private _realEstateAddress;
        bool private _bidActive;
        bool private _auctionActive;

        //Secret Bids
        mapping(address => Bid[]) private _bids;
        //Bids to refund
        mapping(address => Bid[]) public failedBids;
        //highest bid
        NakedBid public highestBid;

        constructor(address payable beneficiaryAddress, string memory realEstate, uint baseBid) {
            _beneficiary = beneficiaryAddress;
            _realEstateAddress = realEstate;
            _bidActive = true;
            _auctionActive = true;
            _minBid = baseBid;
        }

        modifier beneficiaryOnly() {
            if (msg.sender != _beneficiary) revert NoAccess();
            _;
        }

       modifier onlyActiveBid() {
        
            if (_bidActive == false) revert TooLate();
            _;
        }

        modifier onlyReveal() {
        
            if (_bidActive == true || _auctionActive == false) revert RevealPhaseNotActive();
            _;
        }


        event AuctionEnded(address winner, uint highestBid);

        error NoAccess();
        error TooEarly();
        error TooLate();
        error AuctionEndAlreadyCalled();
        error RevealPhaseNotActive();
    

    //Blind bid, requires a minimum deposit of 1 eth
    function bid(bytes32 blindedBind) external payable onlyActiveBid()
        {
         require (msg.value >= 1 ether);

            _bids[_beneficiary].push(Bid({
                bidderAddress: msg.sender,
                blindedBind: blindedBind,
                deposit: msg.value
            }));

        
        }

    //Reveal blind bid
    //The secret should match the secret used to create the blind bid
    function reveal(uint value, string calldata secret) external payable onlyReveal()
        {
            uint length = _bids[_beneficiary].length;

            for (uint i = 0; i < length; i++) {
                Bid storage bidToCheck = _bids[_beneficiary][i];

                if (msg.sender == bidToCheck.bidderAddress && bidToCheck.blindedBind== keccak256(abi.encodePacked(value, secret))) {
                    if(placeBid(bidToCheck, value) == false){

                        failedBids[_beneficiary].push(Bid({
                            bidderAddress: bidToCheck.bidderAddress,
                            blindedBind: bytes32(0),
                            deposit: bidToCheck.deposit
                            }));

                    }             
    
                }
    
            }
            
        }

    //Place bid
    function placeBid(Bid storage bidToCheck, uint value) internal returns (bool success)             
        {
            if (value <= highestBid.bid || value < _minBid) {
                return false;
            }

            if (highestBid.valid) {
                failedBids[_beneficiary].push(Bid({
                bidderAddress: highestBid.bidderAddress,
                blindedBind: bytes32(0),
                deposit: highestBid.deposit
            }));
            }
            highestBid.bid = value;
            highestBid.bidderAddress = bidToCheck.bidderAddress;
            highestBid.deposit = bidToCheck.deposit;
            highestBid.valid = true;

            return true;
        }

        // End auction
        // Pay deposit to beneficiary
        // Pay deposit back to losing bid participants
        function auctionEnd() public payable beneficiaryOnly() onlyReveal()  
        {
            //if (ended) revert AuctionEndAlreadyCalled();
            emit AuctionEnded(highestBid.bidderAddress, highestBid.bid);
            _auctionActive = false;

            uint length = failedBids[_beneficiary].length;
            for (uint i = 0; i < length; i++) {
                Bid storage failedBid = failedBids[_beneficiary][i];
                payable(failedBid.bidderAddress).transfer(failedBid.deposit);
            }

            payable(_beneficiary).transfer(highestBid.deposit);

        }

        function bidEnd() public beneficiaryOnly() {
            _bidActive = false;
        }

        function getBeneficaryAddress() public view returns (address) {
            return _beneficiary;
        }

        function getRealEstateAddress() public view returns (string memory) {
            return _realEstateAddress;
        }

        function getMinBid() public view returns (uint) {
            return _minBid;
        }

    }
