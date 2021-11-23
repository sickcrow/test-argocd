import * as React from 'react';
import MenuQuston from './Menu'
import Perfil from './Perfil'
import menuSVG from '../assets/menu.svg'
import { ReactSVG } from 'react-svg';
import arrow from '../assets/arrow.svg'
import cross from '../assets/cross.svg'
import fotoPerfil from '../assets/perfil.svg'
import ReactGA from 'react-ga';
//import { TrendingUpSharp } from '@material-ui/icons';

export default class CallMenu extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            backarrowExists: false,
        }
    }

    // RECUPERA LAS PRIMERAS 2 LETRAS DEL NOMBRE PARA COLOCAR EN EL PERFIL
    letrasMayus = (nombre) => {
        let array = nombre.split("")
        let mayus = array.filter(e => e !== " " && e === e.toUpperCase())
        return mayus.slice(0,2).join("")
    }

    // CIERRA EL MENÚ EN CASO DE HACER CLICK FUERA DE ÉL
    outTarget = e => {
        const menu = document.getElementById('menu')
        const navbar = document.getElementById('navbar')
        if (e.target !== menu && !navbar.contains(e.target)) {
            if(!this.props.hiddenMenu) {
                this.props.hideMenu(true)
            }
        }
        if (menu) { menu.style.left = '' }
    }

    //INICIA RECONOCIMIENTO "TOUCH" PARA DESLIZAR EL MENÚ
    touchAt = e => {
        const atX = parseInt(e.changedTouches[0].clientX)
        const atY = parseInt(e.changedTouches[0].clientY)
        let menu
        let left = ''
        const touchMove = event => {
            if(e.target !== document.getElementById('navbar')) {
                menu = document.getElementById('menu')
                if (menu) {
                    menu.style.transition = ''
                    const Xaxis = e.changedTouches[0].clientX
                        left = parseInt(Xaxis - event.changedTouches[0].clientX)
                        //MOVIMIENTO CUANDO EL MENÚ ESTÁ ABIERTO(PARA CERRARLO)
                        if(!this.props.hiddenMenu) {
                            if (left < 0) {
                            } else {
                                menu.style.left = -left + 'px'
                            }
                        //MOVIMIENTO CUANDO EL MENÚ ESTÁ CERRAD(PARA ABRIRLO)
                        } else {
                            // if (-left < menu.offsetWidth) {
                            //     if (left < -150) {
                            //         menu.style.left = -(menu.offsetWidth + left) + 'px'
                            //     }
                            // } else {
                            //     menu.style.left = '0px'
                            // }
                        }
                }
            }
        }

        //FINALIZA RECONOCIMIENTO "TOUCH"
        const touchEnd = e => {
            const endX = parseInt(e.changedTouches[0].clientX)
            const endY = parseInt(e.changedTouches[0].clientY)
            if (atX !== endX || atY !== endY) {
                if(left) {
                    if (!this.props.hiddenMenu) { 
                        if(left > 80) {
                            this.props.hideMenu(true)
                            menu.style.left = ''
                        } else {
                            menu.style.left = '0px'
                        }
                    } else {
                        if(left < -82 ) {
                            // this.props.hideMenu(false)
                            // menu.style.left = '0px'
                        } else {
                        this.props.hideMenu(true)
                            menu.style.left = ''
                        }
                    }
                    left = ''
                }
            }


            if (menu) { menu.style.transition = 'left 0.5s' }
            menu = undefined
            document.removeEventListener('touchmove', touchMove)
            document.removeEventListener('touchend', touchEnd)
        }
    
        document.addEventListener('touchmove', touchMove, false);
        document.addEventListener('touchend', touchEnd, false )
    }

    componentDidMount() {
        this.props.hideMenu(true)
        document.addEventListener('click', this.outTarget)
        document.addEventListener('touchstart', this.touchAt, false);
    }

    componentDidUpdate(){
        const verificarArrow = document.getElementById('backarrow') ? true : false
        if(verificarArrow !== this.state.backarrowExists) {
            this.setState({
                backarrowExists: document.getElementById('backarrow') ? true : false
            })
        }
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.outTarget)
        document.removeEventListener('touchstart', this.touchAt);
    }
       
    render(){
        const { backarrowExists } = this.state
        const user = this.props
     
        return ( <div id="navbar" className={"position-relative callMenu d-flex" + (this.props.path !== "/" ? " backwhite" : "")} >

                    {/* CONSULTA SI HAY SUBLINKS PARA EL MENÚ, DE HABER CREA EL MENU */}
                    {this.props.links.length !== 0? 
                    <div id="menu" className={"position-fixed menu" + (this.props.hiddenMenu ? " hiddenMenu" : "")} style={{ width: window.location.href.includes('Tienda') ? '320px' : '200px', transition: 'left 0.5s' }} >

                        {/* CRUZ PARA CERRAR EL MENÚ */}
                        <br /><div onClick={() => this.props.hideMenu()} className="container text-left mx-2" style={{color: '#8E95A5', cursor: 'pointer'}}>
                                <ReactSVG src={cross} style={{width: '11px'}} />
                            </div><br />
                        {/* // CRUZ PARA CERRAR EL MENÚ // */}

                        {/* // MENÚ // */}
                        <MenuQuston hideMenu={this.props.hideMenu} hiddenMenu={this.props.hiddenMenu} links={this.props.links}/>
                        {/* // MENÚ // */}

                    </div>
                    : null }
                    {/* // CONSULTA SI HAY SUBLINKS PARA EL MENÚ, DE HABER MUESTRA EL SVG DEL MENU Y CREA EL MENU // */}
                    
                    {/* ESPERA A RECIBIR LOS DATOS DE PERFIL, CUANDO LOS RECIBE PASA LOS DATOS AL COMPONENTE "PERFIL" */}
                    {!this.props.hiddenPerfil ? 
                    <div id="perfil" className={"position-fixed perfil" + (this.props.hiddenPerfil ? " hiddenPerfil" : "")} >
                        <br/>
                            <div onClick={() => {
                                this.props.setStateNoEstaEnPerfil()
                                this.props.hidePerfil()
                                }} className="container" style={{color: '#8E95A5', cursor: 'pointer'}}>
                                <ReactSVG className="icon" src={arrow} />
                            </div>
                        <br />
                        <Perfil hidePerfil={this.props.hidePerfil} hiddenPerfil={this.props.hiddenPerfil} setStateEstaEnPerfil={this.props.setStateEstaEnPerfil} setStateNoEstaEnPerfil={this.props.setStateNoEstaEnPerfil} perfil={this.props.perfil} setLanding={this.props.setLanding} loggingOut={this.props.loggingOut} />
                    </div>
                    : null }
                    {/* // ESPERA A RECIBIR LOS DATOS DE PERFIL, CUANDO LOS RECIBE PASA LOS DATOS AL COMPONENTE "PERFIL" // */}

                    <div style={this.props.path !== "/" ? {zIndex: "1"}: {}} className={"w-100 callMenu position-fixed d-flex" + (this.props.path !== "/" ? " backwhite" : "") } >

                        {/* SI TIENE SUBLINKS HABILITA EL SVG DEL MENÚ PARA QUE EL USUARIO PUEDA DESPLEGARLO */}
                        {this.props.links.length === 0 || (backarrowExists)? 
                        <div></div> : 
                        <div id="call-menu" onClick={() => {
                            this.props.setStateNoEstaEnPerfil()
                            this.props.hideMenu()
                            }}> 
                            <ReactSVG className="menuimg" src={menuSVG} />
                        </div>
                        }
                        {/* // SI TIENE SUBLINKS HABILITA EL SVG DEL MENÚ PARA QUE EL USUARIO PUEDA DESPLEGARLO // */}

                        {/* LOGO INSTITUCIONAL CON LINK A HOME */}

                        {this.props.path === "/" ? this.props.brandlink(): this.props.brandlinkMenu()}
                        
                        {/* // LOGO INSTITUCIONAL CON LINK A HOME // */}

                    <div className="d-flex navbar-user" >
                            {/* // ICONO DE CAMPANA CON LINK A NOTIFICACIONES // */}
                            {this.props.bell ? this.props.bell : null}

                            {/* // ICONO DE PERFIL CON LINK A PERFIL DEL USUARIO O CERRAR // */}
                            <div className="profile-dropdown" onClick={() => {
                                ReactGA.event({
                                    category: 'Perfil',
                                    action: 'Mostrar Perfil'
                                  });
                                this.props.hidePerfil()}} >
                                <div className="profile-pic" title="Tu Perfil">
                                    {user.img ? <img className="pic" src={user.img} alt="profilepic"/> : <div className="pic">
                                    <img className="pic" src={fotoPerfil} alt="Tu Perfil"/> 
                                    {/*this.props.perfil.nya ? this.letrasMayus(this.props.perfil.nya) : null*/}  </div>}
                                </div>
                            </div>

                            {/* // ICONO DE AYUDA CON LINK A CANAL DE AYUDA// */}
                            {/* <div>
                                <img
                                    src={canalAyuda}                                  
                                    alt="Canal de Ayuda"
                                    width={32}   
                                    height={28}
                                ></img>
                            </div> */}
                        </div>
                    </div>
                </div>
        )
    }
}