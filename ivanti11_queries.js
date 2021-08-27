var accColl = db.getSiblingDB("AccountDb").getCollection("Account")
var policyDb = db.getSiblingDB("Policydb")
var appConfigColl = policyDb.getCollection("ApplicationConfiguration")
var policyGroupColl = policyDb.getCollection("PolicyGroup")
var policyGroupAccDeviceColl = policyDb.getCollection("PolicyGroupAccountDevice")

var ivanti11ConfigQuery = {
    "applicationId" : "0d8ec854-dfa7-4ea7-baf3-c6a3514c424f",
    "apPolicyConfigurationId" : "1d68e2f3-b427-4b14-beb2-c7b7272a793a", 
    "enabled" : true
}
var projection = {
    "accountUid":1,
    "policyUid":1
}
var batchSize = 5;
var skip = 0;
//Get accountUid and policyUid of account that enabled Ivanti11
var ivanti11Configs = appConfigColl.find(ivanti11ConfigQuery,projection)
                               .limit(batchSize)
                               .toArray();  
var listIvanti11AccInfo = []
var totalDevices = 0
while (ivanti11Configs.length>0){
    ivanti11Configs.forEach(function(obj) {
        var accUid = obj["accountUid"]
        //Get policyGroupId in account that enabled Ivanti11
        var policyGroupId = policyGroupColl.findOne({
            "accountUid":accUid, 
            "policies.policyUid": obj["policyUid"]
            })["_id"]
        var totalDevices = policyGroupAccDeviceColl.count({
            "accountUid":accUid,
            "policyGroupUid":policyGroupId
            })
        var findAccUidIndex = listIvanti11AccInfo.findIndex(accInfo => accInfo.accUid == accUid)
        if (findAccUidIndex == -1){                      
            var acc = accColl.findOne({"_id" : accUid})
            var accObj = {
                accUid: accUid,
                accName: acc["name"],
                accNumber: acc["accountNumber"],
                totalDevices: totalDevices
            }
            listIvanti11AccInfo.push(accObj)
        } else {
            listIvanti11AccInfo[findAccUidIndex]["totalDevices"]+= totalDevices
        }          
    }) 
    skip += batchSize
    ivanti11Configs = appConfigColl.find(ivanti11ConfigQuery,projection)
                                 .limit(batchSize)
                                 .skip(skip)
                                 .toArray();
}
printjson(listIvanti11AccInfo)

