import React, { useContext } from "react";
import { Grid } from "react-feather";
import { Link } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
import { H4, Image } from "../../AbstractElements";
import CubaIcon from "../../assets/images/logo/logo.png";

const SidebarLogo = () => {
  const { mixLayout, toggleSidebar, toggleIcon, layout, layoutURL } = useContext(CustomizerContext);

  const openCloseSidebar = () => {
    toggleSidebar(!toggleIcon);
  };

  const layout1 = localStorage.getItem("sidebar_layout") || layout;

  return (
    <div className='logo-wrapper'>
      {layout1 !== "compact-wrapper dark-sidebar" && layout1 !== "compact-wrapper color-sidebar" && mixLayout ? (
        <Link to={`${process.env.PUBLIC_URL}/dashboard/default/${layoutURL}`}>
          <div className="d-flex align-items-center">
          <Image attrImage={{ className: "img-fluid d-inline w-25 rounded", src: `${CubaIcon}`, alt: "" }} />
          <H4 attrH4={{className:"mx-3"}}>JCPL</H4>
          </div>
        </Link>
      ) : (
        <Link to={`${process.env.PUBLIC_URL}/dashboard/default/${layoutURL}`}>
          <div className="d-flex align-items-center">
          <Image attrImage={{ className: "img-fluid d-inline  w-50", src: `${require("../../assets/images/logo/logo_dark.png")}`, alt: "" }} />
          <H4 attrH4={{className:"mx-3"}}>JCPL</H4>
          </div>
        </Link>
      )}
      <div className='back-btn' onClick={() => openCloseSidebar()}>
        <i className='fa fa-angle-left'></i>
      </div>
      <div className='toggle-sidebar' onClick={openCloseSidebar}>
        <Grid className='status_toggle middle sidebar-toggle' />
      </div>
    </div>
  );
};

export default SidebarLogo;
