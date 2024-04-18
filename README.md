## INFORMATION

- Download de zip file in this directory and extract in your computer
- Open with visual studio code

## STEPS TO DEPLOY 
 - First , set a default org for deploy de project

 - Second, in the terminal, go to the manifest directory on nuvolar project, command "cd .\manifest\"

 - Third , use "sf project deploy start --manifest ./package.xml --tests FlightCalculatorControllerTest" for deploy de content in the org, if you are using a 
   Enterprise Edition you must click on Quick deploy after de command is execute (Current Org/Setup/Deployment Status/--content--)

 - Fourth , if the deploy was successfull , you need to add the permisson set "FlightControllerPermissionSet" to the current user that will test the component

 - Fifth, you must go to the app called Nuvolar App, edit the home page and select DefaultHome1 page, you must save and activa that page

 - Sixth, create some airports, then reload home page and try the component :)

 **Note: you can import some airports using the file 'Airport Metadata Example' given, using Data import extension
