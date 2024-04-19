public class FlightCalculatorController {
    

    // METHOD FOR MAKE THE OPERRATION OF CALCULATE DISTANCE BETWEEN TWO SITES
    @AuraEnabled(cacheable=true)
    public static Decimal calculateDistance(Decimal latitude1, Decimal longitude1, Decimal latitude2, Decimal longitude2) { 
        try{
            //check if all parameters al fullfilled
            if(latitude1 != null && longitude1 != null && latitude2!= null && longitude2 != null){
                Integer earthRadius = 6371 * 1000; // in meters
                // Transform coordinates from degrees to radians
                Decimal latitudeRadians1 = latitude1 * Math.PI/180;
                Decimal latitudeRadians2 = latitude2 * Math.PI/180;
                // Latitude and longitude differences in radians
                Decimal latitudeDelta = (latitude2 - latitude1) * Math.PI/180;
                Decimal longitudeDelta = (longitude2 - longitude1) * Math.PI/180;
                Decimal a = Math.sin(latitudeDelta/2) * Math.sin(latitudeDelta/2) +
                            Math.cos(latitudeRadians1) * Math.cos(latitudeRadians2) *
                            Math.sin(longitudeDelta/2) * Math.sin(longitudeDelta/2);
                Decimal arc = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                Decimal distance = earthRadius * arc; // in metres
                return distance;
            }else{
                return null;
            }
            
        }catch(Exception e){
            System.debug(e.getMessage());
            return null;
        }
    }

    //GET CURRENT AIRPORTS
    @AuraEnabled(cacheable=true)
    public static List<Airport__c> getAirports() {
        return [SELECT Id,Name,IATACode__c,Location__c FROM Airport__c];
    }

    //CREATE FLIGHTS WITH CURREN DATA
    @AuraEnabled
    public static Id createFlight(Decimal distance,String arrivalAirport, String departureAirport,String idArrivalAirport,String idDepartureAirport) {
        
        try {
            
            FlightService__c flightService = new FlightService__c();
            flightService.Name = departureAirport +' - '+arrivalAirport;
            flightService.DepartureAirport__c = idDepartureAirport;
            flightService.ArrivalAirport__c = idArrivalAirport;
            flightService.FlightDistance__c = distance;
            insert flightService;
            return flightService.Id;
        } catch (Exception e) {
            System.debug(e.getMessage());
            return null;
        } 
    }
}