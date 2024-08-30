import React, { useEffect, useState } from "react";
import style from "../Styles/StartShipment.module.css";
import location from "../Assets/location.png";
import location2 from "../Assets/bxs_map.png";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import { MarkerF } from "@react-google-maps/api";
import axios from 'axios';
import "animate.css";
import { useTranslation } from 'react-i18next';
import{ContactsOutlined } from '@ant-design/icons';

const libraries = ["places"];
const mapContainerStyle = {
  width: "82vw",
  height: "160vh",
  position: "relative",
};

const extractGovernorate = (addressComponents) => {
  const component = addressComponents.find((component) =>
    component.types.includes("administrative_area_level_1")
  );
  if (component) {
    let governorateName = component.long_name;
    // Remove "Governorate" from the name if it exists
    governorateName = governorateName.replace(/ Governorate$/, '').trim();
    return governorateName;
  }
  return "Unknown Governorate";
};


export default function StartShipment() {
  const { t, i18n } = useTranslation();

  const URL = "https://smart-shipment-system.vercel.app/api/v1/client/order/createOrder";
  const [Data, setData] = useState({
    type: "",
    recipentName: "",
    reciepentPhone: "",
    senderName: "",
    senderPhone: "",
    startLoc: { type: "Point", coordinates: [] },
    currentLoc: { type: "Point", coordinates: [] },
    endLoc: { type: "Point", coordinates: [] },
    endLocation: "",
    startLocation: "",
    weight: "",
    quantity: "",
    description: "",
    price:""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Limit startLocation to 8 characters
    if (name === 'startLocation' && value.length > 9) {
      return;
    }
    setData({
      ...Data,
      [name]: value,
    });

    console.log("data",Data);
  };

  const geocodeAddress = (address) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          resolve({ lat: lat(), lng: lng() });
        } else {
          reject(new Error("Geocoding failed: " + status));
        }
      });
    });
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const endLocationCoordinates = await geocodeAddress(Data.endLocation);
      Data.endLoc.coordinates = [endLocationCoordinates.lat, endLocationCoordinates.lng];

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(Data),
      });

      // Fetch nearest deliveries after order creation
      fetchFindPath(Data.startLocation, Data.endLocation);
      fetchNearestDeliveries(Data.startLoc.coordinates.join(','), Data.endLocation);

      const result = await response.json();
      console.log(result);
      setRecommend((recommend) => !recommend);
      console.log("recomment",recommend);
    } catch (error) {
      console.error("There was an error creating the order!", error);
    }
  };

  // find path
  const [findPath, setFindPath] = useState([]);
  const fetchFindPath = (startLocation, endLocation) => {
    axios.get(`https://smart-shipment-system.vercel.app/api/v1/client/order/findPath`, {
      params: {
        orderStartState: startLocation.toLowerCase() ,
        orderEndState: endLocation.toLowerCase()
      }
    })
      .then(response => {
        console.log("find path deliveries fetched", response.data.data.deliveries);
        setFindPath(response.data.data.deliveries);
      })
      .catch(error => console.error("Error fetching path deliveries", error));
  };

  // nearest delivery
  const [nearestDeliveries, setNearestDeliveries] = useState([]);
  const fetchNearestDeliveries = (startLocation, endLocation) => {
    const maxDis = 10000000;
    axios.get('https://smart-shipment-system.vercel.app/api/v1/client/order/nearestDelivery', {
      params: {
        startLocation,
        endLocation,
        maxDis
      }
    })
      .then(response => {
        console.log("Nearest deliveries fetched", response.data.data.deliveries);
        setNearestDeliveries(response.data.data.deliveries);
      })
      .catch(error => console.error("Error fetching nearest deliveries", error));
  };

  const [lat, setLat] = useState();
  const [lon, setLon] = useState();
  const [recommend, setRecommend] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardInfo, setCardInfo] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
  console.log(lat);
  Data.startLoc.coordinates = [lat, lon];
  Data.currentLoc.coordinates = [lat, lon];

  const [address, setAddress] = useState("");
  console.log('address', address)

  const center = {
    lat: lat,
    lng: lon,
  };

  const handleConvert = () => {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: parseFloat(lat), lng: parseFloat(lon) };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          const fullAddress = results[0].formatted_address;
          setAddress(fullAddress);

          // Extract governorate and update startLocation
          const governorate = extractGovernorate(results[0].address_components);
          // Remove "Governorate" from the name if it exists
          const startLocationWithoutGovernorate = governorate.replace(/ Governorate$/, '').trim();
          setData(prevData => ({ ...prevData, startLocation: startLocationWithoutGovernorate }));
        } else {
          setAddress("No results found");
        }
      } else {
        setAddress("Geocoder failed due to: " + status);
      }
    });
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLat(position.coords.latitude);
      setLon(position.coords.longitude);
    });
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyDwAKZ3cPqdVhu_QjMjxb492NTHDMxpMQU",
    libraries,
  });

  if (loadError) {
    return <div>Error loading maps</div>;
  }
  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  const onLoad = (marker) => {
    console.log("marker: ", marker);
  };

  const handleAccept = (delivery) => {
    setSelectedDelivery(delivery);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleCardInfoChange = (event) => {
    const { name, value } = event.target;
    setCardInfo({ ...cardInfo, [name]: value });
  };

  const handlePaymentSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://smart-shipment-system.vercel.app/api/v1/client/order/${selectedDelivery.id}/checkout`,
        { paymentMethod, cardInfo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        console.log("Payment successful", response.data);
      } else {
        console.error("Payment failed", response.data);
      }
    } catch (error) {
      console.error("Error during payment", error);
    }
  };
  return (
    <div className={style.mapContainer}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={center}
      >
        console.log({ lat }, { lon })
        <MarkerF onLoad={onLoad} position={{ lat: lat, lng: lon }} />
      </GoogleMap>

      <h3
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          color: "black",
          paddingLeft: "45%",
          marginTop: "20px",
        }}
      >
        {t('Shipment')}
      </h3>

      <form className={style.form} onSubmit={handleSubmit}>
        {/* sender name*/}
        <div className="form-group">
          <div className={style.inputbox}>
            <label htmlFor="senderName" className={style.productweight}>
              {t('sendername')}
            </label>
            <input
              type="text"
              placeholder={t('placesename')}
              className={style.allinputsize}
              onChange={handleChange}
              id="senderName"
              value={Data.senderName}
              name="senderName"
            />
          </div>
        </div>
        {/* sender phone*/}
        <div className="form-group">
          <div className={style.inputbox}>
            <label htmlFor="senderPhone" className={style.productweight}>
              {t('senderphone')}
            </label>
            <input
              type="number"
              id="senderPhone"
              name="senderPhone"
              placeholder={t('placesephone')}
              className={style.numericalinput}
              onChange={handleChange}
              value={Data.senderPhone}
            />
          </div>
        </div>

        {/* recipient Name*/}
        <div className="form-group">
          <div className={style.inputbox}>
            <label htmlFor="recipentName" className={style.productweight}>
              {t('rename')}
            </label>
            <input
              type="text"
              placeholder={t('placesename')}
              className={style.allinputsize}
              onChange={handleChange}
              id="recipentName"
              name="recipentName"
              value={Data.recipentName}
            />
          </div>
        </div>
        {/* recipient phone*/}
        <div className="form-group">
          <div className={style.inputbox}>
            <label htmlFor="reciepentPhone" className={style.productweight}>
              {t('rephone')}
            </label>
            <input
              type="number"
              id="reciepentPhone"
              name="reciepentPhone"
              placeholder={t('placesephone')}
              className={style.numericalinput}
              onChange={handleChange}
              value={Data.reciepentPhone}
            />
          </div>
        </div>

        <div className="form-group">
          <div className={style.inputbox}>
            <label htmlFor="from">
              <img
                src={location}
                alt=""
                className={style.locationimg}
                onClick={handleConvert}
              />
            </label>
            <input
              type="text"
              value={address}
              id="from"
              name="from"
              placeholder={t('from')}
              className={style.allinputsize}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <div className={style.inputbox}>
            <label htmlFor="endLocation">
              <img src={location2} alt="" className={style.locationimg} />
            </label>
            <input
              type="text"
              placeholder={t('to')}
              className={style.allinputsize}
              id="endLocation"
              name="endLocation"
              value={Data.endLocation}
              onChange={(e) => {
                 setData({ ...Data, endLocation: e.target.value });
               }}
            />
          </div>
        </div>
        <div className="form-group">
          <div className={style.inputbox}>
            <label htmlFor="weight" className={style.productweight}>
              {t('prweight')}
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              placeholder="1 bs = 0.5845 kg"
              className={style.numericalinput}
              onChange={handleChange}
              value={Data.weight}
            />
          </div>
        </div>

        <div className="form-group">
          <div className={style.inputbox}>
            <label htmlFor="type" className={style.productweight}>
              {t('prtype')}
            </label>
            <input
              type="text"
              id="type"
              name="type"
              placeholder={t("type")}
              className={style.allinputsize}
              onChange={handleChange}
              value={Data.type}
            />
          </div>
        </div>
        <div className="form-group">
          <div className={style.inputbox}>
            <label htmlFor="quantity" className={style.productweight}>
              {t('Quantity')}
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              placeholder={t('qu')}
              className={style.numericalinput}
              onChange={handleChange}
              value={Data.quantity}
            />
          </div>
        </div>
        <div className="form-group">
          <div className={style.inputbox}>
            <label htmlFor="description" className={style.productweight}>
            {t('Description')}
            </label>
            <input
              type="text"
              id="description"
              name="description"
              placeholder={t('de')}
              className={style.numericalinput}
              onChange={handleChange}
              value={Data.description}
            />
          </div>
        </div>
        <button className={style.butn} type="submit">
          {t('createorder')}
        </button>
      </form>

     {recommend && (
        <div className={style.nearestDeliveries}>

          <div className={style.modalContent}>
          <h3>Deliveries</h3>
          
           <h6 style={{border:"2px solid black",width:"120px",backgroundColor:"yellow"}}>cost is {Data.price} </h6>
          
           
            {findPath.length > 0 ? (
              findPath.map((delivery, index) => (
                <div key={index} className={style.deliveryOption}>
                  <div className={style.flex}>
                  <ContactsOutlined />
                  <span>{delivery.deliveryPerson.name}</span>
                  <span>{delivery.time},{delivery.duration}</span>
                  <span>{delivery.deliveryPerson.name}</span>

                  </div>
                  <span>{delivery.deliveryPerson.phone}</span>

                  <span>{delivery.deliveryPerson.vehicleType}</span>

            <button onClick={() => handleAccept(delivery)} className={style.acceptButton}>{t('accept')}</button>
                </div>
              ))
            ) : (
              nearestDeliveries.map((delivery, index) => (
                <div key={index} className={style.deliveryOption}>
                                  <span>{delivery.name}</span>
                  <button onClick={() => handleAccept(delivery)}>{t('accept')}</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedDelivery && (
        <div className={style.paymentModal}>
          <div className={style.modalContent}>
            <h3>{t('paymenttitle')}</h3>
            <p>{t('paymentsubtitle')}</p>
            <div className={style.paymentOptions}>
              <label>
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={handlePaymentMethodChange}
                />
                {t('cash')}
              </label>
              <label>
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={handlePaymentMethodChange}
                />
                {t('card')}
              </label>
            </div>
            {paymentMethod === 'card' && (
              <div className={style.cardInfo}>
                <label>
                  {t('cardnumber')}
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardInfo.cardNumber}
                    onChange={handleCardInfoChange}
                  />
                </label>
                <label>
                  {t('expirydate')}
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardInfo.expiryDate}
                    onChange={handleCardInfoChange}
                  />
                </label>
                <label>
                  {t('cvv')}
                  <input
                    type="text"
                    name="cvv"
                    value={cardInfo.cvv}
                    onChange={handleCardInfoChange}
                  />
                </label>
              </div>
            )}
            <button onClick={handlePaymentSubmit}>{t('pay')}</button>
          </div>
        </div>
      )}
    </div>
  );
}