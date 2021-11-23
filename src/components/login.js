import React, { Component } from 'react';
import { ThemeInput, ThemeButton} from './items'
import Landing from './landing'
import PasswordChangeRequest from './PasswordChangeRequest'
import Spinner from './spinner'
import './login.css'
import brandLogo from '../assets/brand-logo.png'
import jwt_decode from 'jwt-decode'
import urlServer from '../server'
import { version } from '../../package.json'
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import AppContext from "../context/AppContext";
import {Modal} from '@material-ui/core';

const MySwal = withReactContent(Swal);

class Login extends Component {
  constructor(props){
      super(props);
      this.state={
          username:'',
          password:'',
          KeepMeSigned: false,
          isLogin: true,
          loading: false,
          alert: [],
          successRecover: false,
          cuentaBloqueada: false,
          email: '',
          loginmessage:"¿No estás registrado? Regístrate.",
          open: false
      }
      this.submit = this.submit.bind(this)
  }

  static contextType = AppContext;

  errorModal = (data) => {};

  // Validador del usuario y contraseña

  validateReq = (data) => {
    this.state.alert = [];
    let valid = true;
    if (!data.email) {
      this.state.alert.push("Debes escribir una cuenta de email");
      valid = false;
    } else {
      if (
        !/.@[a-zÑñA-Z0-9]+([.-_]?[a-zÑñA-Z0-9]+)*(\.[a-zÑñA-Z0-9]{2,3})+$/.test(
          data.email
        )
      ) {
        this.state.alert.push("Debes escribir una cuenta de email válida");
        valid = false;
      }
    }
    if (!data.password && data.password !== undefined && this.state.isLogin) {
      this.state.alert.push("Debes escribir una contraseña");
      valid = false;
    }
    if (!valid) {
      this.handleOpen();
    }
    return valid;
  };

  // Verificar si mostrar pantalla de cambio de contraseña
  
  async verificarCambioPassword() {
      
      try {
      let infotoken = JSON.parse(localStorage.infoToken);
      let filtro = {
        email: infotoken.sub  //this.state.username
      }
        
      let myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", "Bearer " + localStorage.token);
      const apiBaseUrl = urlServer + '/api/account/solicitudcambiopassword';
      const value = JSON.stringify(filtro);
      const response = await fetch(apiBaseUrl, {
        method: "POST",
        headers: myHeaders,
        body: value
      });

      const result = await response.text();

      const res = JSON.parse(result);
      if (response.status === 200) {
        
        if(res === true)
        {
          this.context.setPasswordChange(
            <PasswordChangeRequest
                email = {infotoken.sub}
            />
          );
          
        }
        else{
          this.context.setPasswordChange([]);
        }
       
      } else {
          this.context.setPasswordChange([]);
          console.log('Error en la api al intentar verificar si mostrar pantalla de cambio de contraseña');

      }
    } catch (error) {
        console.log('Error al verificar si mostrar pantalla de cambio de contraseña');
    }
  }

  //SUBMIT DEL LOGIN
  async submit(event) {
    //const self = this;

    var nombreUsuario = document.getElementById('nombre-de-usuario');
    nombreUsuario = nombreUsuario !== null ? nombreUsuario.value : '';
    var password = document.getElementById('contraseña');
    password = password !== null ? password.value : '';
    this.setState({username: nombreUsuario });
    this.setState({password: password });
    let signed = false
    if (localStorage.recordarme === 'true' && nombreUsuario !== '') {
      localStorage.setItem("username", nombreUsuario);
      signed = true

    } else {
      localStorage.removeItem("username");
    }

    const payload = this.state.isLogin ? { email: nombreUsuario,
                                            password: password,
                                            KeepMeSigned: this.state.KeepMeSigned,
                                            signed: signed
                                          }
                                        : { email: nombreUsuario };
    if (this.validateReq(payload)) {
      this.setState({
        loading: true,
      });
      if (this.state.isLogin) {
        let myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Content-Type", "application/json");
        const apiBaseUrl = urlServer + `/api/account/login`;
        const value = JSON.stringify(payload);
        await fetch(apiBaseUrl, {
          method: "POST",
          headers: myHeaders,
          body: value,
        })
          .then((response) => response.text())
          .catch((error) => {
            console.log("error", error);
            this.setState({
              loading: false,
            });
          })
          .then((result) => {
            const res = JSON.parse(result);
            
            this.setState({username: ''});
            this.setState({password: ''});
        
            if (res.estado) {
              localStorage.setItem("ddr-auth", JSON.stringify(res));
              localStorage.setItem("ddr-token", res.token);
              localStorage.setItem("is_authenticated", "true");
              localStorage.setItem("token", res.token);
              localStorage.setItem(
                "infoToken",
                JSON.stringify(jwt_decode(res.token))
              );
              localStorage.setItem("refresh-token", res.refreshToken);
              localStorage.setItem("expires_in", res.tokenExpiresIn);
              localStorage.setItem("expires_at", res.tokenExpiresAt);



              this.verificarCambioPassword();
 
            } else {

              if(res.mensaje === 'Bloqueado')
              {
                  this.verPantallaDesbloqueo();
                  this.setState({cuentaBloqueada: true});
                  this.setState({
                    loading: false,
                  });

                  this.state.alert = [];
                  this.state.alert.push("Usuario bloqueado. A continuación escribe tu dirección de email para recibir un correo y desbloquear tu usuario");
                  this.handleOpen();
              }
              else
              {
                this.state.alert.push(res.mensaje);
                this.handleOpen();
                this.setState({
                  loading: false,
                });
              }
              
            }
            return res;
          })
          .catch((error) => {
            console.log("error", error);
            this.setState({
              loading: false,
            });
          });
      } else {
        const data = {
          email: payload.email,
        };
        if (this.validateReq(data)) {
          const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
          };
          const apiBaseUrl = urlServer + `/api/account/recuperarPassword`;
          await fetch(apiBaseUrl, {
            method: "POST",
            redirect: "manual",
            body: JSON.stringify(data),
            headers,
          })
            .then(async (response) => {
              if (parseInt(response.status) === 200) {
                return response.json();
              } else {
                let err = await response.json();
                err.status = response.status;
                throw err;
              }
            })
            .then((result) => {

              this.setState({
                loading: false,
              });

              if(this.state.cuentaBloqueada === true)
              {
                  MySwal.fire({
                    icon: "success",
                    title: "Tu solicitud de desbloqueo ha sido recibida con éxito. Por favor, revisa tu correo para completar el desbloqueo!",
                    confirmButtonText: "Aceptar"
                  }).then((res) => {
                    document.getElementById ("nombre-de-usuario").value = "";
                    this.setState({loading: true})
                    window.location.reload();
                  });
              }
              else{
                MySwal.fire({
                    icon: "success",
                    title: "Tu solicitud de cambio de contraseña ha sido recibida con éxito. Por favor revisa tu correo para completar el cambio!",
                    confirmButtonText: "Aceptar"
                  }).then((res) => {
                    document.getElementById("nombre-de-usuario").value = "";
                    this.setState({loading: true})
                    window.location.reload();
                  });
              }
            })
            .catch((error) => {

              this.setState({username: ''});
              this.setState({password: ''});

              MySwal.fire({
                icon: "error",
                title: error.message ? error.message : "Ha ocurrido un error.",
                showConfirmButton: false,
                timer: 1500,
              });
              console.log("error", error);
              this.setState({
                loading: false,
              });
            });
        }
      }
    }
  }

  //ESCUCHA LA TECLA "ENTER" PARA HACER EL LOGIN
  enterKeySubmit = (e) => {
    if (e.which === 13) {
      this.submit(e);
    }
  };

  componentDidMount() {
    this.inputValue()
    document.getElementById(
      "remember-checkbox"
    ).checked = localStorage.recordarme === 'true' ? true : false
    //SI TIENE UNA SESIÓN(NO EXPIRADA) REDIRECCIONA AL HOME
    if (
      localStorage.token &&
      localStorage.infoToken &&
      localStorage["ddr-auth"] &&
      localStorage.is_authenticated
    ) {
      const expiresAt = JSON.parse(localStorage["ddr-auth"]);
      if (
        new Date() <
        new Date(
          new Date(expiresAt.tokenExpiresAt).getTime() +
            expiresAt.tokenExpiresIn * 1000
        )
      ) {


        if(window.location.pathname === "/")
        {
            this.setState({
              loading: true
            
            }, () => this.verificarCambioPassword().then(() => 
            this.setState({
              loading: false
            })))
        }
        else{
            this.context.setLogin([]);
            this.context.setLanding(
            <Landing
              setVieneDeCerrarSesion = {this.setVieneDeCerrarSesion}
              loggingOut={this.context.loggingOut}
              setLanding={this.context.setLanding}
            />)
        }      
        
      }
    }

    const login = document.getElementById("login")
      ? document.getElementById("login")
      : null;
    if (login) {
      login.addEventListener("keydown", this.enterKeySubmit);
    }
  }

  inputValue = () => {
    var nombreUsuario = document.getElementById('nombre-de-usuario');
    if (localStorage.username !== '' && localStorage.username !== undefined ) {
      nombreUsuario.value = localStorage.username
    }   
  }


  verPantallaDesbloqueo = ()  => {
    this.setState({isLogin: false});
  }

  handleOpen = () => {
    this.setState({open: true});
  }

  render() {
    const { isLogin, loading, alert, successRecover, cuentaBloqueada } = this.state;

    const handleClose = () => {
        this.setState({open: false})
    };

    return (
      <div id="login" className="">
        <div
          className="login-form"
          style={successRecover ? { marginTop: "0", height: "auto" } : {}}
        >
          {successRecover ? (
            //CAMBIA BLOQUE DE LOGIN POR MENSAJE DE RECUPERACIÓN DE CONTRASEÑA
            <div id="received" className="modal" tabIndex="-1" role="dialog">
              <div
                className="modal-dialog modal-dialog-centered m-0"
                role="document"
              >
                <div className="modal-content w-100">
                  <div className="modal-body">
                    <p>
                      Le hemos enviado un e-mail con instrucciones para
                      recuperar su contraseña. Por favor, revisa tu correo para completar el proceso.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            //  //CAMBIA BLOQUE DE LOGIN POR MENSAJE DE RECUPERACIÓN DE CONTRASEÑA//
            <React.Fragment>
              <div className="login-title">
                {isLogin ? (
                  <img
                    className="brand-logo"
                    src={brandLogo}
                    alt="brand-logo"                   
                  ></img>
                ) : (
                  <React.Fragment>
                    <img
                      className="brand-logo mb-2"
                      src={brandLogo}
                      alt="brand-logo"
                      onClick={() => {
                        this.setState({ isLogin: !this.state.isLogin })                         
                      }}
                    ></img>
                    
                    {cuentaBloqueada === false ? 
                     <div>  
                        <h4>Recuperar contraseña</h4>
                        <br></br>               
                        <div 
                          className="d-flex justify-content-between remember flex-row-reverse" 
                          style={{ marginBottom: "30px", lineHeight: "20px" }}>
                          Escribe tu dirección de email y luego haz clic sobre el botón enviar para recibir un correo de
                          recuperación de contraseña.
                        </div>
                     </div>
                    : null }
                    {cuentaBloqueada === true ?
                    <div>  
                         <h4>Desbloquear usuario</h4>
                         <br></br> 
                        <div 
                          className="d-flex justify-content-between remember flex-row-reverse" 
                          style={{ marginBottom: "30px", lineHeight: "20px" }}>
                          Escribe tu dirección de email y luego haz clic sobre el botón enviar para recibir un correo y desbloquear 
                          tu usuario.
                        </div>
                      </div>
                    : null }
                  </React.Fragment>
                )}
              </div>

              {/* MODAL QUE MUESTRA LOS ERRORES DEL LOGIN */}
              <div
                className="modal fade"
                id="errorloginModal"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="errorloginModalLabel"
                aria-hidden="true"
              >
                <div
                  className="modal-dialog-centered modal-dialog justify-content-center"
                  role="document"
                >
                  <div
                    className="modal-content"
                    style={{ background: "#EA3F3F" }}
                  >
                    <div className="modal-body f-15 text-center">
                      <ul className="lista-alertas">
                        {alert.map((al, index) => {
                          return <li key={index}> {al} </li>;
                        })}
                      </ul>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary f-13"
                        data-dismiss="modal"
                      >
                        Aceptar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                id="modal"
                className="btn btn-primary"
                data-toggle="modal"
                data-target="#errorloginModal"
              ></button>
              {/* // MODAL QUE MUESTRA LOS ERRORES DEL LOGIN // */}

              {/* BLOQUE DE LOGIN */}
              {loading ? (
                <Spinner />
              ) : (
                <div>
                    {/* Pantalla de login */}
                    
                    <div id="login-box">                 
                      <ThemeInput
                        hintText={
                          isLogin
                            ? "Escribe tu email"
                            : "Escribe tu email con el que te registraste"
                        }
                        labelText="Nombre de usuario"
                        autoComplete="on"
                        onChange={(e) =>
                          null
                        }
                      />
                      {isLogin ? (
                        <ThemeInput
                          hintText="Escribe tu contraseña"
                          labelText="Contraseña"
                          type="password"
                          onChange={(e) =>
                            null
                          }
                        />
                      ) : null}
                      <div className="d-flex flex-column-reverse remember">
                        <div
                          onClick={() => {
                            this.setState({ isLogin: !this.state.isLogin })
                            this.setState({cuentaBloqueada: false});                            
                          }
                          }
                        >
                            {
                             !cuentaBloqueada ? 
                              (isLogin ? "¿Olvidaste tu contraseña?" : "Volver a la pantalla de Login")
                              : null
                            }

                        </div>
                        {isLogin && !cuentaBloqueada ? (
                            <div
                              className='d-flex row justify-content-center'
                              onClick={(e) => {
                                if (localStorage.recordarme === 'true' || localStorage.recordarme === ''  ) 
                                  localStorage.setItem('recordarme', 'false')
                                else
                                  localStorage.setItem('recordarme', 'true')
                          
                                document.getElementById(
                                  "remember-checkbox"
                                ).checked = localStorage.recordarme === 'true' ? true : false
                                }
                            }>
                              <div style={{ display: "inline-block" }}>
                                <input id="remember-checkbox" type="checkbox" />
                              </div>
                              <label className='d-flex'
                                style={{
                                  marginLeft: "10px",
                                  display: "inline-block"
                                }}
                              >
                                {" "}
                                Mantener Sesion Iniciada
                              </label>
                          </div>
                        ) : null}
                      </div>
                      
                      <ThemeButton
                        onClick={this.submit}
                        labelText={ isLogin ? "Ingresar" :  "Enviar"}
                        style={style}
                      />
                      
                      {!cuentaBloqueada ?
                        this.props.linkRegistrarse(this.state.loginmessage)
                      :null }

                      </div>

                      <Modal
                        open={this.state.open}
                        onClose={handleClose}>
                        
                            <div style={{
                                  backgroundColor: '#EA3F3F',
                                  color: 'white',
                                  padding: '16px',
                                  maxWidth: '400px',
                                  width: '85%',
                                  height:'auto',
                                  position: 'fixed',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  fontSize: '15px',
                                  fontFamily: 'roboto',
                                  borderRadius: '5px',
                                  overflow: 'auto'
                                  }}>
                                
                                <div align="center">
                                    <ul className="lista-alertas">
                                        {alert.map((al, index) => {
                                          return <li key={index}> {al} </li>;
                                        })}
                                    </ul>
                                </div>
                                <div align="right" style={{marginTop: '15px'}}>
                                    <button style={{
                                              backgroundColor: '#EA3F3F',
                                              borderWidth: '0px',
                                              fontSize: '13px',
                                              color: 'white'}}
                                      type="button" onClick={handleClose}>
                                      Aceptar
                                    </button>
                                </div>
                            </div>

                      </Modal>


                </div>
              )}
              {/* // BLOQUE DE LOGIN // */}

            </React.Fragment>
          )}
        </div>
        <div className="version mb-1" >v{version}</div>
      </div>
      
    );
  }
}
const style = {};

export default Login;
