import React, { useEffect, useState } from 'react';
import { FloatButton, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Steps, Col, Row } from "antd";
import style from "../Styles/AdminTracing.module.css";
import To from "../Assets/to.svg";
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import { MessageOutlined, PhoneOutlined } from "@ant-design/icons";
import axios from "axios";
import { color } from 'framer-motion';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  position: "relative",
};

export default function Tracing() {
  // Initialize state without data
  const [category, setCategory] = useState([]);
  const [id, setId] = useState();
  const [status, setStatus] = useState();
  const [date, setDate] = useState();
  const [lau, setLat] = useState();
  const [lon, setLon] = useState();
  const [address, setAddress] = useState('');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [trips, setTrips] = useState([]);
  const [deliveryData, setDeliveryData] = useState([]);


  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('https://smart-shipment-system.vercel.app/api/v1/admin/getAllOrders');
      const fetchedOrders = response.data.data.orders || [];
      console.log('all orders', fetchedOrders);
      const deliveryData = fetchedOrders.map(order => order.delivery).flat();
      console.log('data for delivery', deliveryData);
      setDeliveryData(deliveryData)

      // Assuming the trips are stored in the delivery data
      const allTrips = deliveryData.map(delivery => delivery.trip).flat();
      setTrips(allTrips);

      setOrders(fetchedOrders);
      setFilteredOrders(fetchedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const handleBtns = (e) => {
    const filter = e.target.value;
    if (filter === "coming") {
      const filtered = orders.filter(order => order.status === "coming");
      setFilteredOrders(filtered);
    } else if (filter === "delivered") {
      const filtered = orders.filter(order => order.status === "delivered");
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  };

  const handleSearch = (e) => {
    const orderId = e.target.value.trim();
    setSearchTerm(orderId);
    if (orderId) {
      const filtered = orders.filter(order => order._id === orderId);
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  };

  const center = {
    lat: 31.131395, // Default latitude
    lng: 33.771214 // Default longitude
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDwAKZ3cPqdVhu_QjMjxb492NTHDMxpMQU',
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

  function handlePrint() {
    window.print();
  }

  const getPathCoordinates = (trip) => {
    return [
      { lat: trip.startLoc.coordinates[0], lng: trip.startLoc.coordinates[1] },
      { lat: trip.endLoc.coordinates[0], lng: trip.endLoc.coordinates[1] }
    ];
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-5 col-md-5" style={{ backgroundColor: "#EEEDEB", height: "100000px" }}>
          <h6 style={{ margin: "20px" }}>Shipment</h6>
          <Input
            onChange={handleSearch}
            value={searchTerm}
            prefix={<SearchOutlined style={{ color: "Black", fontSize: "20px", fontWeight: "900" }} />}
            placeholder="Enter Track Number"
            className={style.search}
          />
          <div className={style.buttons}>
            <button className={style.button1} value="all" onClick={handleBtns}>All</button>
            <button className={style.button1} value="coming" onClick={handleBtns}>Coming</button>
            <button className={style.button1} value="delivered" onClick={handleBtns}>Delivered</button>
          </div>
          <div className={style.active}>
            {filteredOrders.map((item) => (
              <div key={item._id} className={style.data}>
                <div className={style.flex}>
                  <h5>#{item._id}</h5>
                  <button>{item.status}</button>
                </div>
                <img src={item.url} style={{ marginLeft: "65%", width: "50px", height: "50px", borderRadius: "25px" }} alt="" />
                <hr style={{ borderTop: "2px solid black" }} />
                <Row>
                  <Col xs={{ span: 5, offset: 1 }} lg={{ span: 8, offset: 2 }}>
                    <h6 style={{ color: "#A4A3A3", fontWeight: "400" }}>Order date&time</h6>
                    <h5 style={{ marginLeft: "2%", fontWeight: "600" }}>{item.date}</h5>
                  </Col>
                  <Col xs={{ span: 5, offset: 1 }} lg={{ span: 10, offset: 2 }}>
                    <h6 style={{ marginLeft: "15%", color: "#A4A3A3", fontWeight: "400" }}>Delivery date&time</h6>
                    <h5 style={{ marginLeft: "15%", fontWeight: "600" }}>{item.date}</h5>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </div>

        <div className="col-sm-5 col-md" style={{ margin:"10px" }}>
          <div className={style.inger}>
            <div className="col-sm-5 col-md-6">

            {filteredOrders.map((item) => (
            <>
              <div className={style.flex}>
                <h5 style={{marginRight:"20%"}}>#{item._id}</h5>
                <button >{item.status}</button>
                <button onClick={handlePrint}>Download Report</button>
              </div>

              <div className={style.flex}>
                <div className="col-sm-5  col-md-6" style={{ border: "3px solid  rgb(202, 198, 198)", borderRadius: "10px", padding: "10px" ,height:"900px",width:"350px"}}>
                  <p className={style.orderdetails}>ORDER DETAILS</p>
                  <div className={style.flex}>
                    <div>
                      <p className={style.fromTo}>{item.startLocation}</p>
                      <p style={{ color: "#A4A3A3", fontSize: "15px" }}>{item.date}</p>
                    </div>
                    <img src={To} alt="" style={{ marginLeft: "5%", marginRight: "5%" }} />
                    <div>
                      <p className={style.fromTo}>{item.endLocation}</p>
                      <p style={{ color: "#A4A3A3", fontSize: "15px" }}>{item.date}</p>
                    </div>

                  </div>
                  {/*Tracking shipment virtical*/}
                  <Steps progressDot current={3}
                     direction="vertical" 
                     style={{height:"55%"}}
                    items={[
                      {
                        title: "Receiving",
                        description: item.startLocation,
                        date: item.date
                      },
                      {
                        title: "Shipped",
                      },
                      {
                        title: "On the way",
                      },
                      {
                        title: "delivered",
                        description: item.endLocation,
                        date: item.endLoc

                      },
                    ]} />

                  {/*product details*/}
                  <p className={style.productdetails}>PRODUCT DETAILS</p>
                  <div className={style.flex}>
                    <div style={{ marginRight: "25%" }}>
                      <p style={{ color: "#A4A3A3", fontSize: "18px", fontWeight: "500" }}>DELIVERY COST</p>
                      <p style={{ fontSize: "18px", fontWeight: "600" }}>{item.delivarycost}EGY</p>
                    </div>
                    <div>
                      <p style={{ color: "#A4A3A3", fontSize: "18px", fontWeight: "500" }}>WEIGHT</p>
                      <p style={{ fontSize: "18px", fontWeight: "600" }}>{item.weight}Ibs</p>
                    </div>
                  </div>

                  <div className={style.flex}>
                    <div style={{ marginRight: "25%" }}>
                      <p style={{ color: "#A4A3A3", fontSize: "18px", fontWeight: "500" }}>PRODUCT TYPE</p>
                      <p style={{ fontSize: "18px", fontWeight: "600" }}>{item.type}</p>
                    </div>
                    <div>
                      <p style={{ color: "#A4A3A3", fontSize: "18px", fontWeight: "500" }}>ITEMS</p>
                      <p style={{ fontSize: "18px", fontWeight: "600" }}>{item.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
                </>
          ))}
            </div>
            <div className="col-sm-5 col-md-6">
              <div className={style.map}>
                <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={6}
            center={center}
          >
            {trips.map((trip, index) => (
              <div key={index}>
                <Marker position={{ lat: trip.startLoc.coordinates[0], lng: trip.startLoc.coordinates[1] }} />
                <Marker position={{ lat: trip.endLoc.coordinates[0], lng: trip.endLoc.coordinates[1] }}     />
                <Polyline
                  path={getPathCoordinates(trip)}
                  options={{
                    strokeColor: "#FF0000",
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                  }}
                />
              </div>
            ))}
          </GoogleMap>
              </div>
              <div style={{ border: "3px solid  rgb(202, 198, 198)", borderRadius: "10px", padding: "10px" ,height:"auto",width:"200px"}}>
              {deliveryData.map((delivery) => (
                <div>


                 </div>

                ))}
              </div>

            </div>
          </div>
       </div>
      </div>
    </div>
  );
}