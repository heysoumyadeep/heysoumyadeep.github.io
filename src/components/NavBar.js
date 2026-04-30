import React, {useState} from "react";
import "./NavBar.css";
import NavBarItems from "./NavBarItems";
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import { Link } from "react-router-dom";

function NavBar() {

    const [navBar, setNavBar] = useState(false); 
    const showNavBar = () => showNavBar(!navBar);

  return (
    <>
      <div className="navigationBar">
        <Link to="#" className="navigationOptions">
        <MenuRoundedIcon variant="contained" color="primary" onClick = {showNavBar}>
        </MenuRoundedIcon>
        </Link>
      </div>
      <nav className={navBar ? 'nav-menu active' : 'nav-menu'}>
          <ul className="nav-menu-items">
              <li className="navbar-toggle">
                  <Link to="#" className="menu-bars">
                    <CloseRoundedIcon variant="contained" color="primary"></CloseRoundedIcon>
                  </Link>
              </li>
          </ul>
          <NavBarItems options="Home" />
          <NavBarItems options="About" />
          <NavBarItems options="Skills" />
          <NavBarItems options="Blog" />
          <NavBarItems options="Contact" />
      </nav>
    </>
  );
}

export default NavBar;
