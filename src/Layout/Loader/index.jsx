import React, { Fragment, useState, useEffect } from 'react';
import './Loader.css'; // Add this to include your styles

const Loader = (props) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [show]);

  return (
    <Fragment>
      <div className={`loader-wrapper-new ${show ? '' : 'loader-hide'}`}>
        <div className="loader-index">
          <div className="circle-border">
            <img
              src={require('../../assets/images/logo/logo-loader.png')}
              alt="logo"
              className="company-logo"
            />
          </div>
        </div>
        {/* <svg>
          <defs></defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur"></feGaussianBlur>
            <feColorMatrix
              in="blur"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            ></feColorMatrix>
          </filter>
        </svg> */}
      </div>
    </Fragment>
  );
};

export default Loader;
