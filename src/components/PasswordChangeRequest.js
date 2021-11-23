import React, { Component } from "react";
import Spinner from "./spinner";
import "./login.css";
import brandLogo from "../assets/brand-logo.png";
import urlServer from "../server";
import { withRouter } from "react-router-dom";
import AppContext from "../context/AppContext";
import ReactGA from 'react-ga';
import { version } from '../../package.json';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal)

class PasswordChangeRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      repetirPassword: "",
      email: "",
      loading: false,
      alerts: []
    };
  }
  

  static contextType = AppContext;

  async componentDidMount() {
    document.title = "Cambiar contraseña";

  }

  handleimputChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  validateReq = (data) => {
    let alerts = [];
    let valid = true;

    if (!data.password || data.password.length === 0) {
      alerts.push("Debes escribir una contraseña");
      valid = false;
    } else if (data.password !== data.repetirPassword) {
      alerts.push("La contraseña y la confirmación no son iguales");
      valid = false;
    }

    if (!valid) {
      this.setState(
        {
          alerts,
        },
        () => {
          const modal = document.getElementById("modal");
          modal.click();
        }
      );
    }
    return valid;
  };

  redirectToLogin = () => {
    this.context.setPasswordChange([]);
    this.props.history.push("/");
  };

  submit = async (e) => {

    ReactGA.event({
      category: 'Cambiar Contraseña',
      action: 'Cambiar Contraseña'
    });
    
    e.preventDefault();
    const { password, repetirPassword } = this.state;
    this.setState({
      loading: true,
    });
    if (!this.validateReq({ password, repetirPassword })) {
      this.setState({
        loading: false,
      });

      return;
    }

    //Agregar código necesario para enviar información al backend
    try {
      let myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", "Bearer " + localStorage.token);
      const apiBaseUrl = urlServer + `/api/account/resetPassword`;
      const payload = {
        password,
        repetirPassword,
        email: this.props.email,
      };
      const value = JSON.stringify(payload);

      const response = await fetch(apiBaseUrl, {
        method: "POST",
        headers: myHeaders,
        body: value,
      });

      if (response.status === 200) {
        this.setState(
          {
            loading: false,
          },
          () => {

            MySwal.fire({
              icon: 'success',
              title: 'Tu contraseña ha sido cambiada correctamente. En breve serás redirigido a la pantalla de inicio.', 
              showConfirmButton: false,
              timer: '3000'
            }).then((result) => {
              if(result)
              {
                this.redirectToLogin();
              }
            });

          }
        );
      } else {
        const result = await response.text();

        const res = JSON.parse(result);

        const alerts = [res.message];

        this.setState(
          {
            loading: false,
            alerts,
          },
          () => {
            const modal = document.getElementById("modal");

            modal.click();
          }
        );
      }
    } catch (error) {
      console.log(error);

      this.setResultado({ encabezado: "Error", mensaje: "error" });
    }
  };
  
  setResultado = ({ encabezado, mensaje }) => {
    document.getElementById(
      "reset-form"
    ).innerHTML = `<div><h4 class="mb-5">¡${encabezado}!</h4><div class="f-13-5">${mensaje}</div></div>`;
  };

  render() {
    const { loading, alerts } = this.state;

    return (
      <React.Fragment>
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
            <div className="modal-content" style={{ background: "#EA3F3F" }}>
              <div className="modal-body f-15 text-center">
                <ul className="lista-alertas">
                  {alerts.map((alert) => {
                    return <li key={alert}> {alert} </li>;
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
        <form id="resetpassword" className="backlogin h-100vh w-100">
         <div className="login-title">
            <img className="brand-logo mb-0" src={brandLogo} alt="brand-logo" />
         </div> 
         
          {loading ? (
            <Spinner />
          ) : (
            <div id="reset-form">
               <div className="mx-auto">
                  <h4>Cambiar contraseña</h4>
                  <br></br>
                  <div 
                      className="d-flex justify-content-center mx-auto" 
                      style={{marginBottom: "30px", lineHeight: "20px", width: '300px', fontSize: '14px' }}>
                      Escribe tu nueva contraseña en las dos casillas y luego haz clic sobre el botón Confirmar para completar el cambio.
                </div>
              </div> 
              <div className="theme-input mx-auto">
                <input
                  type="password"
                  className="theme-input-box"
                  placeholder="Escribe tu nueva contraseña"
                  autoComplete="off"
                  onChange={this.handleimputChange}
                  name="password"
                />
              </div>
              <div className="theme-input mx-auto">
                <input
                  type="password"
                  className="theme-input-box"
                  placeholder="Confirma tu nueva contraseña"
                  autoComplete="off"
                  onChange={this.handleimputChange}
                  name="repetirPassword"
                />
              </div>
              <div className="div-button">
                <button className="theme-button" onClick={this.submit}>
                  Confirmar
                </button>
              </div>
              <div className="version mb-1" >v{version}</div>
            </div>
          )}
        </form>
      </React.Fragment>
    );
  }
}

export default withRouter(PasswordChangeRequest);
