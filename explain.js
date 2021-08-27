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
//-------------FIRST QUERY-----------------
appConfigColl.find(ivanti11ConfigQuery,projection).explain()

//-------------SECOND QUERY-----------------
policyGroupColl.find({
    "accountUid":"82bd1c07-1305-4654-b0ec-2f8cdca02e1d", 
    "policies.policyUid": "002b52f9-24e5-4d69-a7e4-9aad9678ba4d"
    }).explain()
            
//-------------THIRD QUERY-----------------          
policyGroupAccDeviceColl.find({
    "accountUid":"d9f10d51-cd5d-45bd-930d-d6e6f7b2e6b2",
    "policyGroupUid":"215fd641-d07f-458e-9f69-a0da6c097055"
    }).explain()
                                
