var accColl = db.getSiblingDB("AccountDb").getCollection("Account")
var policyDb = db.getSiblingDB("Policydb")
var appConfigColl = policyDb.getCollection("ApplicationConfiguration")
var policyGroupColl = policyDb.getCollection("PolicyGroup")
var policyGroupAccDeviceColl = policyDb.getCollection("PolicyGroupAccountDevice")

var anyConnectConfigQuery = {
    "applicationId" : "13abdbb1-e343-45cf-b891-f344b0392a83",
    "enabled" : true
}
var projection = {
    "accountUid":1,
    "policyUid":1
}
var batchSize = 20;
var skip = 0;
//Get accountUid and policyUid of account that enabled AnyConnect
var anyConnectConfigs = appConfigColl.find(anyConnectConfigQuery,projection)
                               .limit(batchSize)
                               .toArray();  
var listAnyConnectAccInfo = []
var totalDevices = 0
while (anyConnectConfigs.length>0){
    anyConnectConfigs.forEach(function(obj) {
        var accUid = obj["accountUid"]
        //Get policyGroupId in account that enabled AnyConnect
        var policyGroupId = policyGroupColl.findOne({
            "accountUid":accUid, 
            "policies.policyUid": obj["policyUid"]
            })["_id"]
        var totalDevices = policyGroupAccDeviceColl.count({
            "accountUid":accUid,
            "policyGroupUid":policyGroupId
            })
        var findAccUidIndex = listAnyConnectAccInfo.findIndex(accInfo => accInfo.accUid == accUid)
        if (findAccUidIndex == -1){                      
            var acc = accColl.findOne({"_id" : accUid})
            var accObj = {
                accUid: accUid,
                accName: acc["name"],
                accNumber: acc["accountNumber"],
                totalDevices: totalDevices
            }
            listAnyConnectAccInfo.push(accObj)
        } else {
            listAnyConnectAccInfo[findAccUidIndex]["totalDevices"]+= totalDevices
        }          
    }) 
    skip += batchSize
    anyConnectConfigs = appConfigColl.find(anyConnectConfigQuery,projection)
                                 .limit(batchSize)
                                 .skip(skip)
                                 .toArray();
}
printjson(listAnyConnectAccInfo)
