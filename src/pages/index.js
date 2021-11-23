import * as React from 'react';
import { ReactSVG } from 'react-svg';
import { Link } from 'react-router-dom'
import './index.css'
import cuentacorriente from '../assets/cuentacorriente.svg'
import devoluciones from '../assets/devoluciones.svg'
import suscripciones from '../assets/suscripciones.svg'
import pedidos from '../assets/pedidos.svg'
import registrarventa from '../assets/registrarventa.svg'
import tienda from '../assets/tienda.svg'
import { version } from '../../package.json'
import novedades from '../assets/novedades.svg'
import urlServer from '../server';
import jwt_decode from 'jwt-decode';

export default class Index extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            cuentacorriente,
            devoluciones,
            suscripciones,
            pedidos,
            registrarventa,
            tienda,
            novedades,
            descripcionesNov: [],
            estaEnPerfil: false,
            cantidadPermisos: 0
        }
    }


    listadoNovedades = async () => {
        const headers = {
            "Content-Type": 'application/json',
            "Accept": 'application/json',
            Authorization: 'Bearer ' + localStorage.token
        }

        const data = {
            NombreTienda: "TIENDA AGEA"
        }

        const url = urlServer + "/api/novedades/novedadesVigentes/listar"

        const respuesta = await fetch(url,{
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers: headers
        })
        .then(response => response.json())
        .then(result => {
            this.setState({ descripcionesNov: result.rows })
        })
        .catch(error => { console.log('error', error) })

        return respuesta
    }

    renderNotifications() {
        const { descripcionesNov } = this.state

        return (
            <React.Fragment>
                {this.state.descripcionesNov ?
                   descripcionesNov.length === 0 ? null :  <span id='notification' class=""> {descripcionesNov.length} </span> 
                : null}
            </React.Fragment>
        )
    }
    
    isWithNotif = (name) => {
        if (name === 'Novedades' ) {
            return this.state.descripcionesNov.length !== 0 ? '10px' : '0px'
        } else {
            return '0px'
        }
    }

    styleForNov = {
        position: 'relative',
        bottom: this.isWithNotif()
    }

    reAutenticacion = async () => {
        let cantidadPermisos = JSON.parse(localStorage.getItem('infoToken'))['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'].length;
        this.setState({cantidadPermisos: cantidadPermisos})

        const headers = {
            "Content-Type": 'application/json',
            "Accept": 'application/json',
            Authorization: 'Bearer' + localStorage.token
        }
        
        const data = {
            refreshToken: localStorage.getItem('refresh-token'),
            keepMeSigned: localStorage.getItem('recordarme') === 'true' ? true : false,
            email: localStorage.getItem('username'),
            expiresAt: localStorage.getItem('expires_at'),
            expiresIn: parseInt(localStorage.getItem('expires_in'))
        };
        const url = urlServer + "/api/account/reAuthentication"

        const respuesta = await fetch(url,{
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers: headers
        })
        .then(response => response.json())
        .then(result => {
            
            const res = result;

            if (res.expiro) {
                localStorage.removeItem('ddr-auth');
                localStorage.removeItem('ddr-token');
                localStorage.removeItem('is_authenticated');
                localStorage.removeItem('token');
                localStorage.removeItem('infoToken');
                localStorage.removeItem('refresh-token');
                localStorage.removeItem('expires_in');
                localStorage.removeItem('expires_at');
                window.location.reload();
            } else if (!res.expiro && res.estado) {
                this.setState({username: ''});
                this.setState({password: ''});
                localStorage.setItem("ddr-auth", JSON.stringify(res));
                localStorage.setItem("ddr-token", res.token);
                localStorage.setItem("is_authenticated", "true");
                localStorage.setItem("token", res.token);
                localStorage.setItem(
                "infoToken",
                JSON.stringify(jwt_decode(res.token))
                );
                localStorage.setItem("refresh-token", res.refreshToken);
                localStorage.setItem('expires_at', res.tokenExpiresAt)
                localStorage.setItem('expires_in', res.tokenExpiresIn)
                cantidadPermisos = JSON.parse(localStorage.getItem('infoToken'))['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'].length;
                if (this.state.cantidadPermisos !== cantidadPermisos) {
                    this.props.setStateUpdateLanding();
                }
            }

           
        })
        .catch(error => { console.log('error', error) })

        return respuesta    
    }


    componentDidMount() {
        let {ejecutarLogOut} = this.state
        if (!ejecutarLogOut) {
            let mantenerSesion = localStorage.getItem('recordarme') === 'true' ? true : false;
            if (mantenerSesion) {this.reAutenticacion()}
            this.listadoNovedades()
            this.props.setStateNoEstaEnPerfil()
        }
        
    }

    renderIndex = () => {
        const { links } = this.props

        return(
            <React.Fragment>
                <div className="index-menu">
                    <div style={{display: 'grid', gridGap: '10px', gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", justifyItems: 'center'}}>
                        {links ? (links.map((link, index) => {
                            return  <div key={index} className="index-menu-box d-flex align-items-center justify-content-center flex-column position-relative box-content" >
                                        {link.name === 'Novedades' && !this.props.estaEnPerfil ? this.renderNotifications() : ''}
                                        <Link className={link.name === 'Novedades' && (this.state.descripcionesNov) ? (this.state.descripcionesNov.length !== 0 && !this.state.estaEnPerfil ? 'withNotif' : 'noNotif'): 'noNotif'}  onClick={() => {this.props.hideMenu(true)}} to={link.link}>
                                            <ReactSVG style={{color: '#8E95A5', width: '28px', height: '32px', position:'relative', left: '0', right: '0', bottom: '0px', margin: 'auto'}} src={this.state[link.link.replace("/", "").toLowerCase()]}/>
                                            <span>
                                                {link.name}
                                            </span>
                                        </Link>
                                    </div>
                        }))
                        : null}
                    </div>
                </div>
                <div className="version mb-1" >v{version}</div>
            </React.Fragment>
            
        )
    }

    render(){
        const {redirect} = this.state
        return (

            <div className="index">
                { this.renderIndex() }
            </div>
        )
    }
}