// eslint-disable-next-line no-unused-vars
import React from 'react'
import style from "../Styles/StartShipment.module.css";
import Map from "../Components/Map";
import  { useState } from 'react';
import { Button, message, Steps } from 'antd';


const steps = [
  {
    
    content: <Map />,
  },
  {
    content: 'Last-content',
  },
];
const StartShipment = () => {
{/*const { token } = theme.useToken();*/}
  const [current, setCurrent] = useState(0);
  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const items = steps.map((item) => ({
    key: item.title,
  }));
  const contentStyle = {
    marginTop: 16,
  };
  return (
    < >
    
      <Steps current={current} items={items} className={style.step}/>
      <div className="flex">
    {/*Previous */}
      {current > 0 && (
          <Button
            className={style.previousbutton}
            onClick={() => prev()}
          >
            Previous
          </Button>
        )}
         {/*next */}

         {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}        
               className={style.nextbutton}
>
            Next
          </Button>
        )}
            {/*done */}

        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => message.success('Processing complete!')}                className={style.nextbutton}
          >
            Done
          </Button>
        )}
      </div>

            {/*content */}

      <div style={contentStyle} className={style.app}>{steps[current].content}</div>
      <div
        style={{
          marginTop: 24,
        }}
      >
        
      </div>
    </>
  );
};
export default StartShipment;


