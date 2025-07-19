import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, LogIn, Mail, User } from "react-feather";
import man from "../../../assets/images/dashboard/profile.png";
import { LI, UL, Image, P } from "../../../AbstractElements";
import CustomizerContext from "../../../_helper/Customizer";
import { Account, Admin, Inbox, LogOut, Taskboard } from "../../../Constant";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../Redux/slices/auth";
import axios  from "axios";
import { API_URL } from "../../../Config/AppConstant";

const UserHeader = () => {
  const {user , isAuthenticated}= useSelector(state=> state.auth)
  const history = useNavigate();
  const dispatch = useDispatch();
  const [profile, setProfile] = useState("");
  const [name, setName] = useState("Unknown");
  const { layoutURL } = useContext(CustomizerContext);
  const authenticated = JSON.parse(localStorage.getItem("authenticated"));
  const auth0_profile = JSON.parse(localStorage.getItem("auth0_profile"));

  useEffect(() => {
    setProfile(localStorage.getItem("profileURL") || man);
    setName(localStorage.getItem("Name") ? localStorage.getItem("Name") : name);
  }, []);

  const Logout = () => {
    const response =  axios.post(`${API_URL}/users/logoutUser`);
    localStorage.removeItem('token');
    localStorage.removeItem('login');
    localStorage.removeItem('authenticated');
    history(`${process.env.PUBLIC_URL}/login`); // Redirect to login page
  };

  const UserMenuRedirect = (redirect) => {
    history(redirect);
  };

  return (
    <li className="profile-nav onhover-dropdown pe-0 py-0">
      <div className="media profile-media">
        <Image
          attrImage={{
            className: "b-r-10 m-0",
            src: `${profile}`,
            alt: "",
          }}
        />
        <div className="media-body">
          <span>{user?.name}</span>
          <P attrPara={{ className: "mb-0 font-roboto" }}>
            {user?.email} <i className="middle fa fa-angle-down"></i>
          </P>
        </div>
      </div>
      <UL attrUL={{ className: "simple-list profile-dropdown onhover-show-div" }}>
        <LI
          attrLI={{
            onClick: () => UserMenuRedirect(`${process.env.PUBLIC_URL}/app/users/profile/${layoutURL}`),
          }}>
          <User />
          <span>{Account} </span>
        </LI>
        <LI
          attrLI={{
            onClick: () => UserMenuRedirect(`${process.env.PUBLIC_URL}/app/email-app/${layoutURL}`),
          }}>
          <Mail />
          <span>{Inbox}</span>
        </LI>
        <LI
          attrLI={{
            onClick: () => UserMenuRedirect(`${process.env.PUBLIC_URL}/app/todo-app/todo/${layoutURL}`),
          }}>
          <FileText />
          <span>{Taskboard}</span>
        </LI>
        <LI attrLI={{ onClick: Logout }}>
          <LogIn />
          <span>{LogOut}</span>
        </LI>
      </UL>
    </li>
  );
};

export default UserHeader;
