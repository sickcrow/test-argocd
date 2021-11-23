import * as React from 'react';
import { Router, Switch, Route } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import AbrirReclamo from '../pages/abrirReclamo'
import ListarReclamos from './listarreclamos'

export default class Reclamos extends React.Component {
    constructor(props){
      super(props);
      this.state={
        render:[],
        results: [],
        links: [],
        accordion: false,
      }
    }

    
    history = createBrowserHistory()

    allowedLinks = (arrLinks) => {
        const Links = localStorage.infoToken && JSON.parse(localStorage.infoToken)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        const allowedLinks = arrLinks.map((e, index, self) => {
            const { path } = e.props
            if (path.toLowerCase().includes("reclamos")) {
            const initSlice = path.indexOf('/', path.indexOf('/') + 1)
            const stringlink = path.slice(initSlice + 1, undefined)
            const permisosUser = Links.filter(e => e.includes(stringlink))
            if(permisosUser.length > 0) {
                return e
            }
            } else {
            return e
            }
        })
        return allowedLinks
    }

    componentWillUnmount() {
      this.props.hideMenu(true)
    }
    render(){

      return ( 
        <React.Fragment>
          <Router history={ this.props.props.history } >
            <Switch>
                <Route exact path="/Reclamos" render={ (props) => <ListarReclamos props={props} 
                                            hideMenu={this.props.hideMenu} />} />,
                {this.allowedLinks([
                    <Route key={0} 
                       exact path="/Reclamos/AbrirReclamo" 
                       render={ (props) => <AbrirReclamo 
                                            props={props} 
                                            hideMenu={this.props.hideMenu} />} />
                ])}
            </Switch>
          </Router>
        </React.Fragment>
        )
    }
}