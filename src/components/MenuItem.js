import * as React from 'react';
//import PropTypes from 'prop-types'
//import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom';

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
//import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Collapse from '@material-ui/core/Collapse'

import IconExpandLess from '@material-ui/icons/ExpandLess'
import IconExpandMore from '@material-ui/icons/ExpandMore'
//import StarBorder from '@material-ui/icons/StarBorder'
//import { TrendingUpOutlined } from '@material-ui/icons';

const MenuItem = props => {
  const { name, link, prod, items = [], hideMenu,isChildren } = props
  const isExpandable = items && items.length > 0
  const [open, setOpen] = React.useState(false)

  function handleClick(e) {
      setOpen(!open)
  }
   
  const MenuItemRoot = (
    <ListItem button  onClick={handleClick}  >
        {isExpandable &&  
          <ListItemText primary={ 
            <span style={{fontSize: name.toLowerCase() !== "productos" && name.toLowerCase() !== "ver categorias" ? '15px': '16px'}}> 
              {name}
              {!open && <IconExpandMore style={{pointerEvents: "none"}}  />}
              { open && <IconExpandLess style={{pointerEvents: "none"}} />}
            </span>
            } style={{marginLeft: name.toLowerCase() === "productos" ? '0px' : (name.toLowerCase() === "ver categorias"  ? '20px': '40px' )}} />}
          {!isExpandable && <span >
            <ListItemText primary={ name === "Mis Pedidos" || name === "Reclamos" ? <Link   
            onClick={() => {hideMenu(true)}} 
            to={{pathname: link}} > 
            {name.toLowerCase() !== "publicaciones" ? name : "Cargar Pedidos"} 
            </Link> : 
            
            window.location.href.includes('Tienda') ?
            <Link style={{marginLeft: name.toLowerCase() === "ver todos los productos" ? '20px' : '60px' }} 
            onClick={() => {
                hideMenu(true)
                window.location.href="/Tienda/CargarPedido?categoria=" + link + "&producto=" + prod
              }} 
            to={{pathname:'#'}}> 
            {name.toLowerCase() !== "publicaciones" ? name : "Cargar Pedidos"} 
            </Link> :

            <Link  
              to={{pathname:link}}> 
            {name.toLowerCase() !== "publicaciones" ? name : "Cargar Pedidos"} 
            </Link>
            
          } />
          </span>}
    </ListItem>
  )

  const MenuItemChildren = isExpandable ? (
    <Collapse in={open} timeout="auto" unmountOnExit >
      <Divider />
      <List component="div" disablePadding >
        {items.map((item, index) => (
            <MenuItem {...item} key={index}  hideMenu={hideMenu} isChildren={true}/>
          
        ))}
          
      </List>
    </Collapse>
  ) : null

  return (
    <>
      {MenuItemRoot}
      {MenuItemChildren}
    </>
  )
}



export default MenuItem
