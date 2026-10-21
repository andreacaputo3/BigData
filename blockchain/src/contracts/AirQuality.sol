// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract AirQuality {
    struct PollutionData {
        uint256 id;
        string parameter;
        uint256 value;
        uint256 datetimeUtc;
        string location_name;
        string granularity;
    }

    mapping(uint256 => PollutionData) public pollutionRecords;
    uint256[] public pollutionRecordIds;
    uint256 public nextId;

    mapping(address => uint256) public userBalances;
    address public admin;
    uint256 public pricePerCreditInWei;

    mapping(bytes32 => bool) public storedData;

    event PollutionDataRecorded(uint256 indexed id, uint256 datetimeUtc, string parameter, uint256 value, string location_name, string granularity);
    event UserBalanceUpdated(address user, uint256 newBalance);
    event UserPurchasedCredits(address user, uint256 amount);

    constructor(uint256 _pricePerCreditInWei) {
        require(_pricePerCreditInWei > 0, "Il prezzo per credito deve essere maggiore di zero");
        admin = msg.sender;
        pricePerCreditInWei = _pricePerCreditInWei;
        nextId = 0;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Solo amministratore puo eseguire questa azione");
        _;
    }

    function isAdmin(address user) public view returns (bool) {
        return user == admin;
    }

    function purchaseCredits() public payable {
        require(msg.value > 0, "Devi inviare Ether per acquistare crediti");
        uint256 creditsPurchased = msg.value / pricePerCreditInWei;
        require(creditsPurchased > 0, "Crediti insufficienti per l'importo inviato");
        userBalances[msg.sender] += creditsPurchased;
        emit UserPurchasedCredits(msg.sender, creditsPurchased);
        emit UserBalanceUpdated(msg.sender, userBalances[msg.sender]);

        payable(admin).transfer(msg.value);
    }

    function dataExists(
        string memory pollutant,
        uint256 timestamp,
        string memory city,
        string memory granularity
    ) public view returns (bool) {
        bytes32 key = keccak256(abi.encodePacked(pollutant, timestamp, city, granularity));
        return storedData[key];
    }

    function storePollutionData(
        string memory parameter,
        uint256 value,
        uint256 datetimeUtc,
        string memory location_name,
        string memory granularity
    ) public onlyAdmin {
        bytes32 key = keccak256(abi.encodePacked(parameter, datetimeUtc, location_name, granularity));
        require(!storedData[key], "Dati gia memorizzati");

        storedData[key] = true;

        pollutionRecords[nextId] = PollutionData(nextId, parameter, value, datetimeUtc, location_name, granularity);
        pollutionRecordIds.push(nextId);
        emit PollutionDataRecorded(nextId, datetimeUtc, parameter, value, location_name, granularity);

        nextId++;
        require(nextId > 0, "ID di registrazione overflow");
    }

    function getPollutionDataByCityParameterAndTime(
        string memory city,
        string memory parameter,
        uint256 startTimestamp,
        uint256 endTimestamp
    ) public view returns (PollutionData[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < pollutionRecordIds.length; i++) {
            PollutionData memory data = pollutionRecords[pollutionRecordIds[i]];
            if (
                keccak256(bytes(data.location_name)) == keccak256(bytes(city)) &&
                keccak256(bytes(data.parameter)) == keccak256(bytes(parameter)) &&
                data.datetimeUtc >= startTimestamp &&
                data.datetimeUtc <= endTimestamp
            ) {
                count++;
            }
        }

        PollutionData[] memory results = new PollutionData[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < pollutionRecordIds.length; i++) {
            PollutionData memory data = pollutionRecords[pollutionRecordIds[i]];
            if (
                keccak256(bytes(data.location_name)) == keccak256(bytes(city)) &&
                keccak256(bytes(data.parameter)) == keccak256(bytes(parameter)) &&
                data.datetimeUtc >= startTimestamp &&
                data.datetimeUtc <= endTimestamp
            ) {
                results[index] = data;
                index++;
            }
        }
        return results;
    }

    function viewPollutionData(uint256 id) public view returns (string memory parameter, uint256 value, uint256 datetimeUtc, string memory location_name, string memory granularity) {
        require(userBalances[msg.sender] > 0, "Devi avere crediti per visualizzare i dati");
        require(id < nextId, "ID non valido");
        PollutionData memory data = pollutionRecords[id];
        return (data.parameter, data.value, data.datetimeUtc, data.location_name, data.granularity);
    }

    function decrementUserBalance() public {
        require(userBalances[msg.sender] > 0, "Saldo insufficiente");
        userBalances[msg.sender]--;
        emit UserBalanceUpdated(msg.sender, userBalances[msg.sender]);
    }

    function getAllPollutionRecordIds() public view returns (uint256[] memory) {
        return pollutionRecordIds;
    }

    function getPollutionDataById(uint256 id) public view returns (string memory parameter, uint256 value, uint256 datetimeUtc, string memory location_name, string memory granularity) {
        PollutionData memory data = pollutionRecords[id];
        return (data.parameter, data.value, data.datetimeUtc, data.location_name, data.granularity);
    }

    function getBalance(address user) public view returns (uint256) {
        return userBalances[user];
    }

    function getAllStoredData() public view returns (PollutionData[] memory) {
        PollutionData[] memory results = new PollutionData[](pollutionRecordIds.length);
        for (uint i = 0; i < pollutionRecordIds.length; i++) {
            results[i] = pollutionRecords[pollutionRecordIds[i]];
        }
        return results;
    }

    function getAllTimestamps() public view returns (uint256[] memory) {
        uint256[] memory timestamps = new uint256[](pollutionRecordIds.length);
        for (uint i = 0; i < pollutionRecordIds.length; i++) {
            timestamps[i] = pollutionRecords[pollutionRecordIds[i]].datetimeUtc;
        }
        return timestamps;
    }

    receive() external payable {}
}
