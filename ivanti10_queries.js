var policyDb = db.getSiblingDB("Policydb")
var appConfigColl = policyDb.getCollection("ApplicationConfiguration")
var policyGroupColl = policyDb.getCollection("PolicyGroup")
var policyGroupAccDeviceColl = policyDb.getCollection("PolicyGroupAccountDevice")
var accountColl = db.getSiblingDB("AccountDb").getCollection("Account")
var RRPolicyExecutionResultColl = db.getSiblingDB("ReportRepairDb").getCollection("RRPolicyExecutionResult")

//Get accountUid and policyUid of accounts that enabled Ivanti10
//Query result can have multiple policyUids from diferent policyGroups for 1 account
var ivanti10Configs = appConfigColl.find({
		"applicationId" : "0d8ec854-dfa7-4ea7-baf3-c6a3514c424f",
		"apPolicyConfigurationId" : "1d68e2f3-b427-4b14-beb2-c7b7272a793a",
		"enabled" : true
	},{
		"accountUid":1,
		"policyUid":1
	}).toArray();  
var listIvanti10AccInfo = []
ivanti10Configs.forEach(function(obj) {
    var foundAccountUid = obj["accountUid"]
    //Get policyGroup from account and policyUid that enable Ivanti10
    var policyGroup = policyGroupColl.findOne({
        "accountUid":foundAccountUid, 
        "policies.policyUid": obj["policyUid"]
    })
	if (policyGroup != null){
		//Get list device uids in policyGroup above
		var listDeviceUidPolicyGroup = getListDeviceUid(policyGroupAccDeviceColl,{
			"accountUid":foundAccountUid,
			"policyGroupUid":policyGroup["_id"]
		},500)
		//Get list device uids of devices that excuted LANDesk
		var listDeviceUidExcutedPolicy = getListDeviceUid(RRPolicyExecutionResultColl,{
			"accountUid" : foundAccountUid,  
			"rr.lANDesk.stat": {$not: {$in: ["Disabled", null]}}   
		},500);
		//Count total device: intersection of 2 list above
		var totalDevices = listDeviceUidPolicyGroup.filter(value => listDeviceUidExcutedPolicy.includes(value)).length
		var findAccUidIndex = listIvanti10AccInfo.findIndex(accountInfo => accountInfo.accountUid == foundAccountUid)
		//If account is not in result list
		if (findAccUidIndex == -1){
			//Add account to result list
			var account = accountColl.findOne({"_id" : foundAccountUid})
			var accountObj = {
				accountUid: foundAccountUid,
				accountName: account["name"],
				accountNumber: account["accountNumber"],
				totalDevices: totalDevices
			}
			listIvanti10AccInfo.push(accountObj)
		} else {
			//update totaldevices
			listIvanti10AccInfo[findAccUidIndex]["totalDevices"]+= totalDevices
		}    
	}
}) 
printjson(listIvanti10AccInfo)
function getListDeviceUid(collection, query, batchSize){
	var projection = {"_id": 1}
	var listDeviceUid = []
	var skip = 0;
	var queryResult = collection.find(query, projection)
						.limit(batchSize)
						.toArray();
	while (queryResult.length>0){
		listDeviceUid = listDeviceUid.concat(queryResult.map( function(u){ 
			return u["_id"];
		}));
		skip += batchSize
		queryResult = collection.find(query, projection)
						.limit(batchSize)
						.skip(skip)
						.toArray();
	}
	return listDeviceUid
}
