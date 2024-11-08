import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonCheckbox, IonButton, IonList, IonAlert, IonInput, IonSelectOption, IonSelect } from '@ionic/react';
import './Home.css';
import { PayUUpiPlugin } from 'payu-upi-bolt-ui-capacitor';
import { Plugins } from '@capacitor/core';

import { sha512 } from 'js-sha512';
import { sha256 } from 'js-sha256';

interface HashMap<T> {
  [key: string]: T;
}

const Home: React.FC = () => {

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [amount, setAmount] = useState('1');
  const [mobileNumber, setMobileNumber] = useState("8095987572");
  const [selectedValue, setSelectedValue] = useState('ALL');

  const presentAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const [isCCTxnEnabled, setIsCCTxnEnabled] = useState(false);


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

  const handleRegisterAndPay = () => {

    const currentTimeMillis = new Date().getTime()

    const initParams: SdkInitParams = {
      merchantName: 'PayU',
      merchantKey: 'smsplus',
      phone: mobileNumber,
      email: 'upi@email.com',
      requestId: 'payu_' + currentTimeMillis,
      pluginTypes: ["AXIS"], // AXIS or HDFC
      isProduction: true,
      excludedBanksIINs: []
    };

    PayUUpiPlugin.initSDK({ config: JSON.stringify(initParams) })

    const paymentParams: PaymentParams = {
      amount: amount,
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
      isCCTxnEnabled: isCCTxnEnabled
    };

    PayUUpiPlugin.registerAndPay({ paymentParams: JSON.stringify(paymentParams) })

  };

  const handleManagementScreen = () => {

    const managementScreenType = selectedValue; // "ALL" or "TRANSACTIONHISTORY" or "MANAGEUPIACCOUNTS" or "DISPUTE" or "DEREGISTERUPI"
    PayUUpiPlugin.openUPIManagement({ screenType: managementScreenType })

  };

  useEffect(() => {

    const generateHashListener = Plugins.PayUUpiPlugin.addListener('generateHash', (data: HashData) => {
      console.log('Data received from Android:', data);
      const hashData = data;
      if (hashData != null) {
        handleHashGeneration(hashData);
      }
    });

    const onPayUSuccessListener = Plugins.PayUUpiPlugin.addListener('onPayUSuccess', (data: JSON) => {
      console.log('Data received from Android:', data);
      presentAlert(JSON.stringify(data));
    });

    const onPayUCancelListener = Plugins.PayUUpiPlugin.addListener('onPayUCancel', (data: JSON) => {
      console.log('Data received from Android:', data);
      presentAlert(JSON.stringify(data));
    });

    const onPayUFailureListener = Plugins.PayUUpiPlugin.addListener('onPayUFailure', (data: JSON) => {
      console.log('Data received from Android:', data);
      presentAlert(JSON.stringify(data));
    });

    return () => {
      onPayUSuccessListener.remove();
      onPayUCancelListener.remove();
      onPayUFailureListener.remove();
      generateHashListener.remove(); // Clean up the listener when the component unmounts
    };
  }, []);


  interface HashData {
    hashName: string;
    hashString: string;
    hashType: string;
  }

  const handleHashGeneration = async (map: HashData): Promise<void> => {
    const hashData = map.hashString;
    const hashName = map.hashName;

    let hash = await generateHashFromSDK(hashData, '1b1b0');

    const hashMap: HashMap<string> = {};
    hashMap['hashName'] = hashName;
    hashMap[hashName] = hash;
    PayUUpiPlugin.hashGenerated({ hashData: JSON.stringify(hashMap) })

  };

  const calculateHash = async (hashString: string): Promise<string> => {
    const hash = sha512(hashString); // Use sha512 library
    return hash;
  };

  const generateHashFromSDK = async (hashData: string, salt: string): Promise<string> => {
    return calculateHash(`${hashData}${salt}`);
  };


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Amount</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>Payment Options</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>UPI</IonLabel>
            <IonLabel>Link your bank accounts for Faster payments</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Amount</IonLabel>
            <IonInput
              type="number"
              placeholder="Enter amount"
              className="top-input"
              maxlength={3}
              value={amount}
              onIonChange={e => setAmount(e.detail.value || '')}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Mobile Number</IonLabel>
            <IonInput
              type="tel"
              placeholder="Enter mobile number"
              maxlength={10}
              className="bottom-input"
              value={mobileNumber}
              onIonChange={e => setMobileNumber(e.detail.value || '')}
            />
          </IonItem>
          <IonButton onClick={handleRegisterAndPay} expand="block">
            Register and Pay
          </IonButton>
          <IonButton onClick={handleManagementScreen} expand="block">
            Linked Accounts
          </IonButton>
          <IonItem style={{ "--inner-padding-end": "0px", display: "flex", alignItems: "center" }}>
            <IonCheckbox
              checked={isCCTxnEnabled}
              onIonChange={(e) => setIsCCTxnEnabled(e.detail.checked)}
            />
            <IonLabel>Enable Credit Card transactions</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>Enforce Nav: </IonLabel>
            <IonSelect value={selectedValue} onIonChange={e => setSelectedValue(e.detail.value)}>
              <IonSelectOption value="ALL">ALL</IonSelectOption>
              <IonSelectOption value="TRANSACTIONHISTORY">TRANSACTIONHISTORY</IonSelectOption>
              <IonSelectOption value="MANAGEUPIACCOUNTS">MANAGEUPIACCOUNTS</IonSelectOption>
              <IonSelectOption value="DISPUTE">DISPUTE</IonSelectOption>
              <IonSelectOption value="DEREGISTERUPI">DEREGISTERUPI</IonSelectOption>
            </IonSelect>
          </IonItem>

        </IonList>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Alert'}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
