import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import SvgIcon from "../../Components/Common/Component/SvgIcon";
import CustomizerContext from "../../_helper/Customizer";
import { MENUITEMS } from "./Menu";
import * as feather from 'feather-icons';
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../Config/AppConstant";


const SidebarMenuItems = ({ setMainMenu, sidebartoogle, setNavActive, activeClass }) => {
  const { layout } = useContext(CustomizerContext);
  const layout1 = localStorage.getItem("sidebar_layout") || layout;
  const {loading ,user, isAuthenticated}= useSelector(state=> state.auth)
  const [getRoles, setGetRoles] = useState([])
  const [userRole, setUserRole] = useState('')
  
  const id = window.location.pathname.split("/").pop();
  const layoutId = id;
  const CurrentPath = window.location.pathname;


  useEffect(() => {
    if (!loading) {
      if (user?.role) {
        axios
          .get(`${API_URL}/roles`)
          .then((res) => {
            setGetRoles(res.data.data);
            // Find the matching role
            const roleObj = res.data.data.find((item) => item.id === user?.role);
            // console.log(roleObj.name, roleObj.id, user.role)
            setUserRole(roleObj ? roleObj.name : null);
          })
          .catch((error) => console.log(error.message));
      }
    }
  }, [loading, user?.role]);
  
  
  // useEffect(() => {
  //   console.log("Updated userRole:", userRole); // Log the updated userRole
  // }, [userRole]); // This will run when userRole changes
  
  


  const { t } = useTranslation();
  const toggletNavActive = (item) => {
    if (window.innerWidth <= 991) {
      document.querySelector(".page-header").className = "page-header close_icon";
      document.querySelector(".sidebar-wrapper").className = "sidebar-wrapper close_icon ";
      // document.querySelector('.mega-menu-container').classList.remove('d-block');
      if (item.type === "sub") {
        document.querySelector(".page-header").className = "page-header";
        document.querySelector(".sidebar-wrapper").className = "sidebar-wrapper";
      }
    }
    if (!item.active) {
      MENUITEMS.map((a) => {
        a.Items.filter((Items) => {
          if (a.Items.includes(item)) Items.active = false;
          if (!Items.children) return false;
          Items.children.forEach((b) => {
            if (Items.children.includes(item)) {
              b.active = false;
            }
            if (!b.children) return false;
            b.children.forEach((c) => {
              if (b.children.includes(item)) {
                c.active = false;
              }
            });
          });
          return Items;
        });
        return a;
      });
    }
    item.active = !item.active;
    setMainMenu({ mainmenu: MENUITEMS });
  };



  const filterMenuByRole = (menuItems, userRole) => {
    return menuItems
      .map((menu) => {
        // Clone the menu item to avoid modifying the original object
        let newMenu = { ...menu };
  
        // Recursively filter children if they exist
        if (menu.children) {
          newMenu.children = filterMenuByRole(menu.children, userRole);
        }
  
        // Only include the menu item if:
        // - It has no role restriction (`roles` is undefined)
        // - OR It has roles and `userRole` is in the list
        // - OR It has valid `children` after filtering
        if (!menu.roles || menu.roles.includes(userRole) || (newMenu.children && newMenu.children.length > 0)) {
          return newMenu;
        }
  
        return null; // Exclude items that don’t match the role
      })
      .filter(Boolean); // Remove null values
  };
  
  const filteredMenu = filterMenuByRole(MENUITEMS, userRole);
  
  
// console.log(filteredMenu)
// console.log(MENUITEMS)

  return (
    <>
      {filteredMenu.map((Item, i) => (
        <Fragment key={i}>
          <li className="sidebar-main-title">
            <div>
              <h6 className="lan-1">{t(Item.menutitle)}</h6>
            </div>
          </li>
          {Item.Items.map((menuItem, i) => (
            <li className="sidebar-list" key={i}>
              {menuItem.type === "sub" ? (
                <a
                  href="javascript"
                  className={`sidebar-link sidebar-title ${CurrentPath.includes(menuItem.title.toLowerCase()) ? "active" : ""} ${menuItem.active && "active"}`}
                  onClick={(event) => {
                    event.preventDefault();
                    setNavActive(menuItem);
                    activeClass(menuItem.active);
                  }}>
                  <SvgIcon className="stroke-icon" iconId={`stroke-${menuItem.icon}`} />
                  <SvgIcon className="fill-icon" iconId={`fill-${menuItem.icon}`} />
                  <span>{t(menuItem.title)}</span>
                  {menuItem.badge ? <label className={menuItem.badge}>{menuItem.badgetxt}</label> : ""}
                  <div className="according-menu">{menuItem.active ? <i className="fa fa-angle-down"></i> : <i className="fa fa-angle-right"></i>}</div>
                </a>
              ) : (
                ""
              )}

              {menuItem.type === "link" ? (
                <Link to={menuItem.path + "/" + layoutId} className={`sidebar-link sidebar-title link-nav  ${CurrentPath.includes(menuItem.title.toLowerCase()) ? "active" : ""}`} onClick={() => toggletNavActive(menuItem)}>
                  {/* <SvgIcon className="stroke-icon" iconId={`stroke-${menuItem.icon}`} />
                  <SvgIcon className="fill-icon" iconId={`fill-${menuItem.icon}`} /> */}
                 <i style={{color:"#757589",fontSize:"20px",marginRight:"5px"}} className={`icofont icofont-${menuItem.icon}`}></i>
                  <span>{t(menuItem.title)}</span>
                  {menuItem.badge ? <label className={menuItem.badge}>{menuItem.badgetxt}</label> : ""}
                </Link>
              ) : (
                ""
              )}

              {menuItem.children ? (
                <ul className="sidebar-submenu" style={layout1 !== "compact-sidebar compact-small" ? (menuItem?.active || CurrentPath.includes(menuItem?.title?.toLowerCase()) ? (sidebartoogle ? { opacity: 1, transition: "opacity 500ms ease-in" } : { display: "block" }) : { display: "none" }) : { display: "none" }}>
                  {menuItem.children.map((childrenItem, index) => {
                    return (
                      <li key={index}>
                        {childrenItem.type === "sub" ? (
                          <a
                            href="javascript"
                            className={`${CurrentPath.includes(childrenItem?.title?.toLowerCase()) ? "active" : ""}`}
                            // className={`${childrenItem.active ? 'active' : ''}`}
                            onClick={(event) => {
                              event.preventDefault();
                              toggletNavActive(childrenItem);
                            }}>
                            {t(childrenItem.title)}
                            <span className="sub-arrow">
                              <i className="fa fa-chevron-right"></i>
                            </span>
                            <div className="according-menu">{childrenItem.active ? <i className="fa fa-angle-down"></i> : <i className="fa fa-angle-right"></i>}</div>
                          </a>
                        ) : (
                          ""
                        )}

                        {childrenItem.type === "link" ? (
                          <Link
                            to={childrenItem.path + "/" + layoutId}
                            className={`${CurrentPath.includes(childrenItem?.title?.toLowerCase()) ? "active" : ""}`}
                            // className={`${childrenItem.active ? 'active' : ''}`} bonusui
                            onClick={() => toggletNavActive(childrenItem)}>
                            {t(childrenItem.title)}
                          </Link>
                        ) : (
                          ""
                        )}

                        {childrenItem.children ? (
                          <ul className="nav-sub-childmenu submenu-content" style={CurrentPath.includes(childrenItem?.title?.toLowerCase()) || childrenItem.active ? { display: "block" } : { display: "none" }}>
                            {childrenItem.children.map((childrenSubItem, key) => (
                              <li key={key}>
                                {childrenSubItem.type === "link" ? (
                                  <Link
                                    to={childrenSubItem.path + "/" + layoutId}
                                    className={`${CurrentPath.includes(childrenSubItem?.title?.toLowerCase()) ? "active" : ""}`}
                                    // className={`${childrenSubItem.active ? 'active' : ''}`}
                                    onClick={() => toggletNavActive(childrenSubItem)}>
                                    {t(childrenSubItem.title)}
                                  </Link>
                                ) : (
                                  ""
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          ""
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                ""
              )}
            </li>
          ))}
        </Fragment>
      ))}
    </>
  );
};

export default SidebarMenuItems;
