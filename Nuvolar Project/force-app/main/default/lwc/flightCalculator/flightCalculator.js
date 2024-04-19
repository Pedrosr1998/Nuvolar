import { LightningElement,wire,track,api } from 'lwc';
import getAirports from '@salesforce/apex/FlightCalculatorController.getAirports'
import calculateDistance from'@salesforce/apex/FlightCalculatorController.calculateDistance';
import createFlight from '@salesforce/apex/FlightCalculatorController.createFlight';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class FlightCalculator extends NavigationMixin(
    LightningElement
) {
    arrivalAirportValue = undefined; // variable to save the first ID
    departureAirportValue  = undefined;// variable to save the second ID
    arrivalAirportName = undefined;// variable to save the first Name
    departureAirportName  = undefined;// variable to save the second Name
    latitude1 = undefined; // variable to save the first latitud
    longitude1 = undefined;// variable to save the first longitude
    latitude2 = undefined;// variable to save the second latitud
    longitude2 = undefined;// variable to save the second longitude
    distance = 0;

    @track autoCompleteOptions = []; // filtered list of options based on search string ( first )
    @track autoCompleteOptions2 = []; // filtered list of options based on search string ( second )
    @track objectsList = []; // complete list of objects returned by the apex method
    @track objectsMap = {}; // useful to get a map
    @track options = []; // options to view

    @api isObjectSelectionRO = false;

    get disabled()
    { 
        return this.selectedDeparture == undefined
    }
    get disabledButton(){
        
        return (this.arrivalAirportValue == undefined || this.departureAirportValue == undefined) || (this.distance <= 0|| this.distance == undefined);
    }
    @api isRequired = false;
    @api selectedArrival;
    @api selectedDeparture;
    @api validate() {
        // to be called from parent LWC if for example the search box is present
        // on a form and needs to be validated before submission.
        this.template.querySelector('lightning-input').reportValidity();
    }

    
    /**
     * Wired Methods
     */
    @wire(getAirports, {})
    wiredObjectsList({ error, data }) {
        this.isLoading = false;

        if (data) {
            let valueInformation = [];
            this.objectsMap = JSON.parse(JSON.stringify(data)); // Deep copy of object
            this.objectsList = Object.values(this.objectsMap); // used for the auto-complete functionality

            //SET ARRAY WITH VALUES NEED
            Object.entries(data).map(([key,value])=>(valueInformation.push({ key,value })));
            for(let x = 0;x<valueInformation.length;x++){
                
                this.options.push({
                    
                    label: valueInformation[x].value.Name,
                    value: valueInformation[x].value.IATACode__c,
                    latitude: valueInformation[x].value.Location__c.latitude,
                    longitude: valueInformation[x].value.Location__c.longitude,
                    id : valueInformation[x].value.Id
                });
            }
        }
        error && console.error("ExampleObjectSearch", "wiredObjectsList", error);
    }

    /**
     * Handlers
     */
    
    handleInputChange(event) {
        this.distance = null;
        this.renderData = null;
        this.selectedObjectAPIName = ''; // resets the selected object whenever the search box is changed
        const inputVal = event.target.value; // gets search input value
        
        // filters in real time the list received from the wired Apex method
        if(event.target.name == "departure"){
            if(inputVal == ''){
                this.selectedArrival = undefined;
                this.arrivalAirportValue == undefined;
                this.departureAirportValue = undefined;
                this.arrivalAirportName = undefined;
                this.departureAirportName = undefined;
            }
           
            this.selectedDeparture= undefined;
            
            this.autoCompleteOptions =  this.objectsList.filter(item => item.IATACode__c.toLowerCase().includes(inputVal.toLowerCase())&& item.IATACode__c != this.selectedArrival);
            // makes visible the combobox, expanding it.
            if (this.autoCompleteOptions.length && inputVal.length>=1) {
                this.template.querySelector('.first.slds-combobox.slds-dropdown-trigger.slds-dropdown-trigger_click').classList.add('slds-is-open');
                this.template.querySelector('.first.slds-combobox.slds-dropdown-trigger.slds-dropdown-trigger_click').focus();
                
            }
        }else{
            this.selectedArrival = undefined;
            this.arrivalAirportValue == undefined;
            this.arrivalAirportName = undefined;
            this.autoCompleteOptions2 = this.objectsList.filter(item => item.IATACode__c.toLowerCase().includes(inputVal.toLowerCase())&& item.IATACode__c != this.selectedDeparture);
            // makes visible the combobox, expanding it.
            if (this.autoCompleteOptions2.length &&  inputVal.length>=1) {
                this.template.querySelector('.second.slds-combobox.slds-dropdown-trigger.slds-dropdown-trigger_click').classList.add('slds-is-open');
                this.template.querySelector('.second.slds-combobox.slds-dropdown-trigger.slds-dropdown-trigger_click').focus();
                
            }
        }
        
        
       
        
    }

    handleOnBlur(event) {
        // Trickiest detail of this LWC.
        // the setTimeout is a workaround required to ensure the user click selects the record.
       setTimeout(() => {
            if (this.selectedDeparture == '') {
                this.selectedDeparture = undefined;
                
            }
            if(this.selectedArrival == ''){
                this.selectedArrival= undefined;
            }
            this.template.querySelector('.slds-combobox.slds-dropdown-trigger.slds-dropdown-trigger_click').classList.remove('slds-is-open');
        }, 300);
    }

    handleOptionClick(event) {

        // Stores the selected objected and hides the combobox and reset data
        if(event.currentTarget.dataset.name == 'Departure'){
            this.selectedDeparture = event.currentTarget.dataset.id;
            this.departureAirportValue = this.options.find(opt => opt.value === event.currentTarget.dataset.id).id;
            this.departureAirportName =this.options.find(opt => opt.value === event.currentTarget.dataset.id).label;
            this.template.querySelector('.first.slds-combobox.slds-dropdown-trigger.slds-dropdown-trigger_click').classList.remove('slds-is-open');
            this.longitude1 = this.options.find(opt => opt.value === event.currentTarget.dataset.id).longitude;
            this.latitude1 = this.options.find(opt => opt.value === event.currentTarget.dataset.id).latitude;
        }else{
            this.selectedArrival = event.currentTarget.dataset.id;
            this.arrivalAirportValue = this.options.find(opt => opt.value === event.currentTarget.dataset.id).id;
            this.arrivalAirportName = this.options.find(opt => opt.value === event.currentTarget.dataset.id).label;
            this.template.querySelector('.second.slds-combobox.slds-dropdown-trigger.slds-dropdown-trigger_click').classList.remove('slds-is-open');
            this.latitude2 = this.options.find(opt => opt.value === event.currentTarget.dataset.id).latitude;
            this.longitude2 = this.options.find(opt => opt.value === event.currentTarget.dataset.id).longitude;
        }
        if(this.latitude2 != null & this.longitude2 != null & this.longitude1 != null & this.latitude1 != null){
            this.handleKeyCalculate();
        }
    }

    handleKeyCalculate(){
		calculateDistance({ latitude1: this.latitude1 ,longitude1:this.longitude1 ,latitude2:this.latitude2 ,longitude2: this.longitude2})
		.then(result => {
            if(result != null){
                this.distance = (result / 1000).toFixed(2); //* Kilometers
            }else{
                this.error = 'Result can not be null';
            }
		})
		.catch(error => {
			this.error = error;
			this.accounts = undefined;
		})
	} 

    // Create the flight 
    @api renderData = false;
    @api flightId = undefined;
    handleFlyCreate() {
    
        createFlight({ 
            distance:this.distance, 
            arrivalAirport:this.arrivalAirportName,  
            departureAirport:this.departureAirportName, 
            idArrivalAirport:this.arrivalAirportValue, 
            idDepartureAirport:this.departureAirportValue
        })
        
        .then(result => {
            
            if(result != null){
                this.flightId = undefined;
                this.renderData = true;
                this.flightId = result;
                this.showToast('Record Created Sucessfully','The flight between '+this.departureAirportName+' and '+this.arrivalAirportName,'success');
            }else{
                this.showToast('Error on the creation of the flight','Review if all data its filled or contact with the administrator','error');
                
            }
		})
		.catch(error => {
			this.showToast('Error on the creation of the flight','Review if all data its filled or contact with the administrator:' +'\n'+error,'error');
			this.accounts = undefined;
		})
    }


    //* EVENTS
    showToast(title,message,variant) {
        const event = new ShowToastEvent({
            title:title,
            message:
                message,
            variant:variant
        });
        this.dispatchEvent(event);
    }

    viewRecord() {
        // Navigate to Account record page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                "recordId": this.flightId,
                "objectApiName": "FlightService__c",
                "actionName": "view"
            },
        });
    }
}