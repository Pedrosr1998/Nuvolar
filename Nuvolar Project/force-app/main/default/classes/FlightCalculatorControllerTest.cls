@isTest
public with sharing class FlightCalculatorControllerTest {

    @TestSetup
    static void makeData(){
        Airport__c airport1 = new Airport__c(
            Name = 'Barcelona Airport',
            IATACode__c = 'BCN',
            Location__Latitude__s = 41.298493618634524,
            Location__Longitude__s =  2.0799880392882235
        );
        Airport__c airport2 = new Airport__c(
            Name = 'Seville Airport',
            IATACode__c = 'SVQ',
            Location__Latitude__s = 37.45443930800978,
            Location__Longitude__s =  -5.911975854011908
        );
        insert new List<Airport__c>{airport1,airport2};
    }
    @isTest
    public static void testGetAirports(){ // Test get method
        Test.startTest();
        List<Airport__c> listAirports = FlightCalculatorController.getAirports();
        Test.stopTest();
        System.assertEquals(2,listAirports.size(),'OK');
    }
    @isTest
    public static void testAirportDistanceCalculator(){ // Test calculateDistance method
        List<Airport__c> listAirports = [SELECT Location__Latitude__s,Location__Longitude__s FROM Airport__c WHERE IATACode__c = 'BCN' OR IATACode__c = 'SVQ' LIMIT 2];
        Test.startTest();
        Decimal distanceKM = FlightCalculatorController.calculateDistance(listAirports[0].Location__Latitude__s,listAirports[0].Location__Longitude__s,listAirports[1].Location__Latitude__s,listAirports[1].Location__Longitude__s)/1000;
        Test.stopTest();
        System.assertEquals(808.541,distanceKM.setScale(3),'OK');
    }
    @isTest
    public static void testAirportDistanceCalculator_NullValue(){ // Test calculateDistance method if one value is Null
        List<Airport__c> listAirports = [SELECT Location__Latitude__s,Location__Longitude__s FROM Airport__c WHERE IATACode__c = 'BCN' OR IATACode__c = 'SVQ' LIMIT 2];
        Test.startTest();
        Decimal distanceKM = FlightCalculatorController.calculateDistance(null,listAirports[0].Location__Longitude__s,listAirports[1].Location__Latitude__s,listAirports[1].Location__Longitude__s);
        Test.stopTest();
        System.assertEquals(null,distanceKM,'OK');
    }
    @isTest
    public static void testCreateFlightService(){ // Test createFlight method
        List<Airport__c> listAirports = [SELECT Id,Name,Location__Latitude__s,Location__Longitude__s FROM Airport__c WHERE IATACode__c = 'BCN' OR IATACode__c = 'SVQ' LIMIT 2];
        Test.startTest();
        Decimal distanceKM = FlightCalculatorController.calculateDistance(listAirports[0].Location__Latitude__s,listAirports[0].Location__Longitude__s,listAirports[1].Location__Latitude__s,listAirports[1].Location__Longitude__s)/1000;
        Id idFlightService = FlightCalculatorController.createFlight(distanceKM.setScale(3),listAirports[0].Name,listAirports[1].Name,String.valueOf(listAirports[0].Id),String.valueOf(listAirports[1].Id));
        Test.stopTest();
        System.assertEquals(true,idFlightService!=null?true:false,'OK');
    }
}