import React from 'react';
import './NavBarItem.css';

function NavBarItems({options}) {
    return (
        <div className="navBarItem">
            {/* {Icon && <Icon className="navBarItem_icon" />} */}
            <p>{options}</p>
            {/* {Icon ? <h4>{items}</h4> : <p>{options}</p>} */}
        </div>
    )
}

export default NavBarItems;