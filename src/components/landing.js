import * as React from 'react';
import { Router, Switch, Route, Link } from 'react-router-dom'

import './App.scss';

import { ArrowUp } from './items'
import { ReactSVG } from 'react-svg'
import { createBrowserHistory } from 'history'
import { Provider } from '../store/perfil'
import Index from '../pages'
import CallMenu from './callMenu'
import Login from './login'
import Notificaciones from './Notificaciones'
import PermisosApp from './permisos.json'
import CuentaCorriente from '../pages/cuentacorriente'
import Suscripciones from '../pages/suscripciones'
import Devoluciones from '../pages/devoluciones'
import Pedidos from '../pages/pedidos'
import PedidosTienda from '../pages/pedidostienda'
import RegistrarVenta from '../pages/registrarventa'
import AbrirReclamo from '../pages/abrirReclamo'
//import CargarPedidos from '../pages/cargarPedido'
import EdicionNovedades from '../pages/edicionNovedades';

import brandLogo from '../assets/brand-logo.png'
import brandLogoMenu from '../assets/brand-logo-menu.png'
import cuentacorriente from '../assets/cuentacorriente.svg'
import devoluciones from '../assets/devoluciones.svg'
import registrarventa from '../assets/registrarventa.svg'
import suscripciones from '../assets/suscripciones.svg'
import pedidos from '../assets/pedidos.svg'
import tienda from '../assets/tienda.svg'
import urlServer from '../server'
import novedades from '../assets/novedades.svg'


// TRANSFORMA EL LINK EN TÍTULO(en caso de que cambie el nombre del link, cambia el nombre del título)
let textualizeLink = (item) => {
  let tempArray = item.split("");
  let i = 0;
  while (i < tempArray.length) {
    if (tempArray[i] === tempArray[i].toUpperCase() && i !== 0) {
      tempArray.splice(i, 0, " ");
      i++;
    }
    i++;
  }
  let itemTitle = tempArray.join("");
  itemTitle = itemTitle.replace(" De ", " de ");
  return itemTitle;
};

// TRANSFORMA ARRAY DE LINKS EN ARRAY DE OBJETOS CON LINK Y TÍTULO


export default class Landing extends React.Component {
  constructor(props){
	super(props)
	this.state = {
	  hiddenMenu: true,
	  hiddenPerfil: true,
	  hiddenNotificaciones: true,
          estaEnPerfil: false,
	  links: [],
          submenuCategoria: [],
	  menuLinkFlag: false,
	  sublinks: [],
	  path: '',
	  perfil: {},
	  assets: {
		  cuentacorriente,
		  devoluciones,
		  suscripciones,
		  pedidos,
		  registrarventa,
		  tienda,
                  novedades
		},
    updateLanding: false
	}
}

setStateUpdateLanding = () => {
  this.setState({updateLanding:!this.state.updateLanding})
  this.componentDidMount()
}

setStateEstaEnPerfil = () => {
  this.setState({estaEnPerfil: true})
}

setStateNoEstaEnPerfil = () => {
  this.setState({estaEnPerfil:false})
}

getLinkAndName = (data, Links) => {
  let menujson = "";
  let fecha = new Date();
  fecha.setMonth(fecha.getMonth() - 6)

  const header = {
      "Content-Type": 'application/json',
      "Authorization": 'bearer ' + localStorage.token
  };

  const url = urlServer + "/api/tienda/categoriaConProductoMasVendido"
  var promesa = fetch(url, {
      method: 'POST',
      headers: header
  }).then((response) => {
      if(response.status === 200)
        return response.json();
      else
        throw response;
  }).then((resp) => {
      menujson = resp;
  }).catch((error) => {
      console.log("error ", error);
  })

  promesa.then(() => {
      let links = [];
      let sublinks = {};
      let menuCollapse = false;
      for (let index = 0; index < data.length; index++) 
      {
        const link = data[index];

        let b = link.replace("KIOSCO.", "");
        if (b.indexOf(".") === -1) 
        {
          let itemLink = "/" + b;
          let itemName = textualizeLink(b=== "Pedidos" ? "Pedidos a Distribuidoras": b=== "Tienda" ? "Pedidos a Tienda" : b);

          let item = {
            link: itemLink,
            name: itemName,
          };
          links = [...links, item];
        } else {
          let path = b.slice(0, b.indexOf("."));
          let item = b.slice(b.indexOf(".") + 1, b.length);
          let itemLink = "/" + path + "/" + item;
          let itemTitle = textualizeLink(item);
          if(itemTitle === "Productos"){
            menuCollapse = true
          }

          let completeLink = {
            link: itemLink,
            name: itemTitle,
            collapse: menuCollapse,
            items : menuCollapse ? menujson
             : "",
          };
          menuCollapse = false;
          if (!sublinks[path]) {
            sublinks[path] = [];
          }
          if (item.indexOf(".") === -1) {
            sublinks[path] = [...sublinks[path], completeLink];
          } else {
            let subpath = item.slice(0, item.indexOf("."));
            let subitem = item.slice(item.indexOf(".") + 1, item.length);
            let sublink = "/" + subpath + "/" + subitem;
            let subname = textualizeLink(subitem);
          
            let finalItem = {
              link: sublink,
              name: subname,
              collapse: menuCollapse
            };
            if (!sublinks[subpath]) {
              sublinks[subpath] = [];
            }
            sublinks[subpath] = [...sublinks[subpath], finalItem];
          }
        }
      }


      
        this.setState({
          links: links,
          sublinks: sublinks,
          perfil: JSON.parse(localStorage.infoToken),
          path: window.location.pathname,
          divnotif: this.bell(
            Links.filter((e) => e.indexOf("Notificaciones") !== -1).length !== 0
              ? true
              : false
          ),
          shortpath:
            window.location.pathname.indexOf("/", 1) !== -1
              ? window.location.pathname.slice(
                  0,
                  window.location.pathname.indexOf("/", 1)
                )
              : window.location.pathname,
        });
      

  });
};




  // RENDERIZA LA CAMPANA DE NOTIFICACIONES, CON LINK A ESA PÁGINA
  bell = (campananotif) => {
    if (campananotif) {
      return (
        <Link to="/Notificaciones">
          <div
            className={
              "bell" +
              (this.state.path === "/Notificaciones" ? " primarycolor" : "")
            }
            title = "Notificaciones"
          >
            
          </div>
        </Link>
      );
    } else {
      return null;
    }
  };

  history = createBrowserHistory();

  // OCULTA O MUESTRA EL MENÚ LATERAL: TRUE OCULTA, FALSE MUESTRA, 'alt' ALTERNA
  hideMenu = (hide = "alt") => {
    if (hide === "alt") {
      const menu = document.getElementById("menu");
      if (menu) {
        menu.style.left = "";
      }
      this.setState({
        hiddenMenu: !this.state.hiddenMenu,
      });
    } else if (hide) {
      this.setState({
        hiddenMenu: true,
      });
    } else if (!hide) {
      this.setState({
        hiddenMenu: false,
      });
    }
    return;
  };

  // OCULTA O MUESTRA EL PERFIL
  hidePerfil = (hide = "alt") => {
    if (hide === "alt") {
      this.setState({
        hiddenPerfil: !this.state.hiddenPerfil,
      });
    }
    return;
  };

  // OCULTA O MUESTRA LAS NOTIFICACIONES
  hideNotificaciones = (hide = "alt") => {
    if (hide === "alt") {
      this.setState({
        hiddenNotificaciones: !this.state.hiddenNotificaciones,
      });
    }
    return;
  };

  // RENDERIZA LOGO INSTITUCIONAL CON LINK A LA HOME
  brandlink = () => {
    return (
      <Link to="/">
        <img
          className="brand-logo navbar-logo"
          src={brandLogo}
          alt="brand"
        ></img>
      </Link>
    );
  };

   // RENDERIZA LOGO INSTITUCIONAL CON LINK A LA HOME
   brandlinkMenu = () => {
    return (
      <Link to="/">
        <img
          className="brand-logo navbar-logo"
          src={brandLogoMenu}
          alt="brand"
        ></img>
      </Link>
    );
  };

  
  //OBTIENE LINKS DE LO RECUPERADO DEL TOKEN
  getLinks = () => {
    const { links, shortpath } = this.state;
    const { menuLinkFlag } = this.state;
    let hidden = [
      <div
        key={0}
        className="icon"
        style={{ cursor: "pointer", color: menuLinkFlag ? "#EA3F3F" : "" }}
        onClick={() =>
          this.setState({ menuLinkFlag: !this.state.menuLinkFlag })
        }
      >
        <i className="fas fa-ellipsis-v"></i>
      </div>,
    ];
    if (links.length > 5) {
      hidden = [
        ...hidden,
        <div
          key={1}
          className="menu-dots"
          style={{ display: menuLinkFlag ? "block" : "none" }}
        >
          {links.map((link, index) => {
            if (index >= 4) {
              return (
                <Link
                  className="d-flex"
                  style={{ height: "40px" }}
                  key={index}
                  onClick={() => {
                    this.hideMenu(true);
                    this.setState({ menuLinkFlag: false });
                  }}
                  to={link.link}
                >
                  <ReactSVG
                    className={
                      "icon " + (shortpath === link.link ? "primarycolor" : "")
                    }
                    style={{ margin: "auto 15px" }}
                    src={
                      this.state.assets[
                        link.link.replace("/", "").toLowerCase()
                      ]
                    }
                  />
                  <div style={{ cursor: "pointer", margin: "auto 0" }}>
                    {link.name}
                  </div>
                </Link>
              );
            }
            return "";
          })}
        </div>,
      ];
    }
    let menuLinks = links.map((link, index) => {
      if (links.length <= 5) {
        return (
          <Link
            key={index}
            onClick={() => {
              this.hideMenu(true);
              this.setState({ menuLinkFlag: false });
            }}
            to={link.link}
          >
            <ReactSVG
              className={
                "icon " + (shortpath === link.link ? "primarycolor" : "")
              }
              src={this.state.assets[link.link.replace("/", "").toLowerCase()]}
            />
          </Link>
        );
      } else {
        if (index < 4) {
          return (
            <Link
              key={index}
              onClick={() => {
                this.hideMenu(true);
                this.setState({ menuLinkFlag: false });
              }}
              to={link.link}
            >
              <ReactSVG
                className={
                  "icon " + (shortpath === link.link ? "primarycolor" : "")
                }
                src={
                  this.state.assets[link.link.replace("/", "").toLowerCase()]
                }
              />
            </Link>
          );
        } else if (index === 4) {
          return (
            <div key={index} id="hidden-links">
              {" "}
              {hidden}{" "}
            </div>
          );
        }
      }
      return "";
    });
    return menuLinks;
  };

  allowedLinks = (arrLinks) => {
    const Links =
      localStorage.infoToken &&
      JSON.parse(localStorage.infoToken)[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];
    
    if (Links) {
        const allowedLinks = arrLinks.map((e, index, self) => {
        const { path } = e.props;
        if (path !== "/" && !path.includes("login")) {
            const initSlice = path.indexOf("/") + 1;
            const finSlice = path.indexOf("/", path.indexOf("/") + 1);
            const stringlink = path.slice(
            initSlice,
            finSlice !== -1 ? finSlice : undefined
          );
          const permisosUser = Links.filter((e) => e.includes(stringlink));
          if (permisosUser.length > 0) {
            return e;
          }
        } else {
          return e;
        }
      });
      return allowedLinks;
    }
  };

  componentDidMount() {
    this.setState({estaEnPerfil:false})
    this.history.listen(async (location) => {
      await this.setState({
        path: window.location.pathname,
        shortpath:
          window.location.pathname.indexOf("/", 1) !== -1
            ? window.location.pathname.slice(
                0,
                window.location.pathname.indexOf("/", 1)
              )
            : window.location.pathname,
      });
    });
    const Links = JSON.parse(localStorage.infoToken)[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ];
  
    const LinksApp = Links.filter((e) => PermisosApp.includes(e));

    const filtLinks = LinksApp.filter(
      (e) =>
        e.indexOf("CargarPedidos") === -1 &&
        e.indexOf("EditarPedidos") === -1 &&
        e.indexOf("Notificaciones") === -1
    );

    this.getLinkAndName(filtLinks, Links);
    
  }

  render() {
    const {
      path,
      shortpath,
      perfil,
      hiddenMenu,
      hiddenPerfil,
      hiddenNotificaciones,
      links,
      sublinks,
      postCuentaCorriente,
      scrollY,
    } = this.state;
    return (
      <Router history={this.history}>
        <div className="position-relative">
          <Provider value={perfil}>
            <div
              className={
                (path === "/" || path === "") &&
                window.location.pathname === "/"
                  ? "backlogin"
                  : "backapp h-100vh"
              }
              style={
                path === "/"
                  ? { minHeight: "calc(100vh - 46px)" }
                  : { minHeight: "calc(100vh - 102px)" }
              }
            >
              <Route
                path="/"
                render={(props) => (
                  <CallMenu
                    path={path}
                    history={this.history}
                    setStateEstaEnPerfil= {this.setStateEstaEnPerfil}
                    setStateNoEstaEnPerfil = {this.setStateNoEstaEnPerfil}
                    setLanding={this.props.setLanding}
                    loggingOut={this.props.loggingOut}
                    perfil={perfil}
                    bell={this.state.divnotif}
                    notificaciones={{
                      not1: {
                        message: "Nueva entrega",
                        category: "CuentaCorriente",
                      },
                    }}
                    props={props}
                    hideMenu={this.hideMenu}
                    hiddenMenu={hiddenMenu}
                    hidePerfil={this.hidePerfil}
                    hiddenPerfil={hiddenPerfil}
                    hideNotificaciones={this.hideNotificaciones}
                    hiddenNotificaciones={hiddenNotificaciones}
                    brandlink={this.brandlink}
                    brandlinkMenu={this.brandlinkMenu}
                    links={
                      sublinks[
                        shortpath
                          ? shortpath.replace("/", "")
                          : path.replace("/", "")
                      ]
                        ? sublinks[
                            shortpath
                              ? shortpath.replace("/", "")
                              : path.replace("/", "")
                          ]
                        : []
                    }
                  />
                )}
              />
              <div id="body" className={path === "/" ? "" : "backapp"}>
                <Switch>
                  {this.allowedLinks([
                    <Route
                      key={0}
                      exact
                      path="/"
                      render={() => (
                        <Index
                          hideMenu={this.hideMenu}
                          hiddenMenu={hiddenMenu}
                          links={links}
                          estaEnPerfil= {this.state.estaEnPerfil}
                          setStateNoEstaEnPerfil= {this.setStateNoEstaEnPerfil}
                          setStateUpdateLanding={this.setStateUpdateLanding}
                        />
                      )}
                    />,
                    <Route
                      key={1}
                      exact
                      path="/login"
                      render={() => (
                        <Login
                          hideMenu={this.hideMenu}
                          hiddenMenu={hiddenMenu}
                        />
                      )}
                    />,
                    <Route
                      key={2}
                      exact
                      path="/CuentaCorriente"
                      render={() => (
                        <CuentaCorriente
                          postCuentaCorriente={postCuentaCorriente}
                          hideMenu={this.hideMenu}
                          hiddenMenu={hiddenMenu}
                        />
                      )}
                    />,
                    <Route
                      key={3}
                      path="/Suscripciones/:route"
                      render={(props) => (
                        <Suscripciones
                          props={props}
                          hideMenu={this.hideMenu}
                          hiddenMenu={hiddenMenu}
                        />
                      )}
                    />,
                    <Route
                      key={4}
                      exact
                      path="/Suscripciones"
                      render={(props) => (
                        <Suscripciones
                          props={props}
                          hideMenu={this.hideMenu}
                          hiddenMenu={hiddenMenu}
                        />
                      )}
                    />,
                    <Route
                      key={5}
                      exact
                      path="/Devoluciones"
                      render={() => (
                        <Devoluciones
                          hideMenu={this.hideMenu}
                          hiddenMenu={hiddenMenu}
                        />
                      )}
                    />,                    
                    <Route
                      key={6}
                      path="/Pedidos/:route"
                      render={(props) => (
                        <Pedidos
                          props={props}
                          hideMenu={this.hideMenu}
                          hiddenMenu={hiddenMenu}
                        />
                      )}
                    />,
                    <Route
                      key={7}
                      exact
                      path="/Pedidos"
                      render={(props) => (
                        <Pedidos
                          props={props}
                          hideMenu={this.hideMenu}
                          hiddenMenu={hiddenMenu}
                        />
                      )}
                    />,
                    <Route
                      key={8}
                      exact
                      path="/RegistrarVenta"
                      render={(props) => <RegistrarVenta props={props} />}
                    />,
                    <Route
                      key={9}
                      exact
                      path="/Notificaciones"
                      render={() => (
                        <Notificaciones
                          assets={this.state.assets}
                          hideMenu={this.hideMenu}
                          hiddenMenu={hiddenMenu}
                          notificaciones={[
                            {
                              message: "Dada de alta",
                              seen: false,
                              category: "Suscripciones",
                            },
                            {
                              message: "El pedido fue despachado",
                              seen: false,
                              category: "Pedidos",
                            },
                            {
                              message: "Dada de alta",
                              seen: false,
                              category: "Suscripciones",
                            },
                            {
                              message: "El pedido fue despachado",
                              seen: true,
                              category: "Pedidos",
                            },
                            {
                              message: "El pedido fue despachado",
                              seen: true,
                              category: "Pedidos",
                            },
                            {
                              message: "El pedido fue despachado",
                              seen: true,
                              category: "Pedidos",
                            },
                            {
                              message: "Dada de alta",
                              seen: true,
                              category: "Suscripciones",
                            },
                          ]}
                        />
                      )}
                    />,
                    <Route
                      key={10}
                      path="/Tienda/:route"
                      render={(props) => (
                        <PedidosTienda
                          props={props}
                          hideMenu={this.hideMenu}
                          hiddenMenu={hiddenMenu}
                        />
                      )}
                    />,
                    <Route
                      key={11}
                      exact
                      path="/Tienda"
                      render={(props) => (
                        <PedidosTienda
                          props={props}
                          hideMenu={this.hideMenu}
                          hiddenMenu={hiddenMenu}
                        />
                      )}
                    />,
                    <Route
                      key={12}
                      exact
                      path="/Reclamos/AbrirReclamo"
                      render={(props) => (
                        <AbrirReclamo
                          props={props}
                          hideMenu={this.hideMenu}
                          hiddenMenu={hiddenMenu}                          
                        />
                      )}
                    />,
                    <Route
                      key={13}
                      exact
                      path="/Novedades"
                      render={(props) => (
                        <EdicionNovedades
                          props={props}
                          hideMenu={this.hideMenu}
                          hiddenMenu={hiddenMenu}
                        />
                        
                      )}
                    />                  		    
                  ])}
                </Switch>
              </div>
            </div>
            <ArrowUp scrollY={scrollY} />
          </Provider>
        </div>
        {(path === "/" || path === "") &&
        window.location.pathname === "/" ? null : (
          <div className={"bottom-nav"}>{this.getLinks()}</div>
        )}
      </Router>
    );
  }
}
