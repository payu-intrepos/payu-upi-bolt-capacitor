import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { PayUUpiPlugin } from 'payu-upi-bolt-ui-capacitor';
import { Plugins } from '@capacitor/core';

import { sha512 } from 'js-sha512';


interface SdkInitParams {
  merchantName: string;
  merchantKey: string;phone: string;
  email: string;
  requestId: string;
  pluginTypes: string[];
  isProduction?: boolean;
  excludedBanksIINs?: string[];
}

interface PaymentParams {
  amount: string;
  productInfo: string;
  firstName: string;
  surl?: string;
  furl?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  txnId: string;
  isCCTxnEnabled?: boolean;
}

interface HashData {
  hashName: string
  hashString: string
  hashType: string
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage  implements OnInit  {

  amount: string = '1';
  mobileNumber: string = '9600105136';
  selectedValue: string = 'ALL'; // Initialize with an empty string or a default value
  isChecked: boolean = false;

  private generateHashListener: any;
  private onPayUSuccessListener: any;
  private onPayUCancelListener: any;
  private onPayUFailureListener: any;

  ngOnInit() {

   this.generateHashListener = Plugins['PayUUpiPlugin']['addListener']('generateHash', (data: HashData) => {
      console.log('generateHashListener Data received from Android:', data);
      if(data != null){
        try {
          this.handleHashGeneration(data);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }
    });

    this.onPayUSuccessListener = Plugins['PayUUpiPlugin']['addListener']('onPayUSuccess', (data: JSON) => {      console.log('onPayUSuccessListener Data received from Android:', JSON.stringify(data));
      console.log('onPayUSuccessListener Data received from Android raw data :', (data));
      console.log('onPayUSuccessListener Data received from Android:', JSON.stringify(data));
      this.showAlert(JSON.stringify(data))
    });

    this.onPayUCancelListener = Plugins['PayUUpiPlugin']['addListener']('onPayUCancel', (data: JSON) => {
      console.log('onPayUCancelListener Data received from Android raw data :', (data));
      console.log('onPayUCancelListener Data received from Android:', JSON.stringify(data));
      this.showAlert(JSON.stringify(data))
    });

    this.onPayUFailureListener = Plugins['PayUUpiPlugin']['addListener']('onPayUFailure', (data: JSON) => {
      console.log('onPayUCancelListener Data received from Android raw data :', (data));
      console.log('onPayUFailureListener Data received from Android:', JSON.stringify(data));
      this.showAlert(JSON.stringify(data))
    });

  }

  ngOnDestroy() {
    this.generateHashListener.remove();
    this.onPayUSuccessListener.remove();
    this.onPayUFailureListener.remove();
    this.onPayUCancelListener.remove();
  }

  constructor(private alertController: AlertController) { }

  async showAlert(message: string) {

    const alert = await this.alertController.create({
      header: 'Alert',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }


  async registerAndPay() {

    const currentTimeMillis = new Date().getTime()

    const initParams: SdkInitParams = {
      merchantName: 'PayU',
      merchantKey: 'smsplus',
      phone: this.mobileNumber,
      email: 'upi@email.com',
      requestId: 'payu_' + currentTimeMillis,
      pluginTypes: ["AXIS"], // AXIS or HDFC
      isProduction: true,
      excludedBanksIINs: []
    };

    PayUUpiPlugin.initSDK({ config: JSON.stringify(initParams) })

    const paymentParams: PaymentParams = {
      amount: this.amount,
      productInfo: 'payu',
      firstName: 'Aswath',
      surl: 'https://payuresponse.firebaseapp.com/success',
      furl: 'https://payuresponse.firebaseapp.com/success',
      udf1: 'udf1',
      udf2: 'udf2',
      udf3: 'udf3',
      udf4: 'udf4',
      udf5: 'udf5',
      txnId: 'payu_' + currentTimeMillis,
      isCCTxnEnabled: this.isChecked
    };
    PayUUpiPlugin.registerAndPay({paymentParams: JSON.stringify(paymentParams)})

  }

  async openUPIManagement() {
    
    const managementScreenType = this.selectedValue; // "ALL" or "TRANSACTIONHISTORY" or "MANAGEUPIACCOUNTS" or "DISPUTE" or "DEREGISTERUPI"
    PayUUpiPlugin.openUPIManagement({ screenType: managementScreenType })

  }
  

  async handleHashGeneration (map: HashData): Promise<void> {
    const hashData = map.hashString;
    const hashName = map.hashName;

    console.log('handleHashGeneration Data received from Android:', map);

    let hash: string;
    hash = await this.generateHashFromSDK(hashData, '1b1b0');

    console.log('handleHashGeneration hash generated is : ', hash);

    const hashMap: Map<string, string> = new Map<string, string> ();
    hashMap.set('hashName', hashName);
    hashMap.set(hashName, hash);

    console.log('handleHashGeneration hash generated forwarded is : ', this.mapToJson(hashMap));

    let hashJson: string = await this.mapToJson(hashMap)

    PayUUpiPlugin.hashGenerated({hashData: hashJson})
  };

  async mapToJson(map: Map<string, string>): Promise<string> {
    const obj: { [key: string]: string } = {};
    map.forEach((value, key) => {
      obj[key] = value;
    });
    return JSON.stringify(obj);
  }
  
  async calculateHash (hashString: string): Promise<string> {
    console.log('calculateHash Data received from Android: hashString : ', hashString);
    const hash = sha512(hashString); // Use sha512 library
    return hash;
  };
 
  async generateHashFromSDK(hashData: string, salt: string): Promise<string> {
    console.log('generateHashFromSDK Data received from Android: hashdata : ', hashData + " salt : ", salt);
    return this.calculateHash(`${hashData}${salt}`);
  };
  
}

