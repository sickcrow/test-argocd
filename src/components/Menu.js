import * as React from 'react';
import List from '@material-ui/core/List';


import MenuItem from './MenuItem'


export default class MenuQuston extends React.Component {
  
    render(){            //RENDERIZA EL MENÚ LATERAL EN CASO DE QUE EXISTAN SUBLINKS
            return ( 
                    <div id="scrollbarMenuProducto" className="container" style={{zIndex: 2, color: '#8E95A5', fontFamily: 'Roboto', fontSize: '22px'}} >
                        <List component="nav"  style={{maxHeight: '100vh', overflow: 'auto', paddingBottom: '150px'}}>
                                {this.props.links.map((item, index) => (  
                                    <MenuItem {...item} key={index} hideMenu={this.props.hideMenu}/>
                                ))}
                        </List>
                    </div> 
            )
    }
}