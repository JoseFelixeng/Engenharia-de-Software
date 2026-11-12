import { useState } from "react";
import { Icon } from "./Icons.jsx";

/** Campo com ícone, label flutuante, erro animado e (opcional) mostrar/ocultar senha. */
export default function Field({ label, icon: Ico, error, type = "text", id, value, onChange, right, ...rest }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <div className="field-box">
        {Ico && <Ico className="field-ico" />}
        <input
          id={id}
          type={isPass && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          {...rest}
        />
        <label htmlFor={id}>{label}</label>
        {isPass && (
          <button type="button" className="field-eye" onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
            {show ? <Icon.EyeOff width={19} height={19} /> : <Icon.Eye width={19} height={19} />}
          </button>
        )}
        {right}
      </div>
      <p className="field-err" id={`${id}-err`} role="alert">{error}</p>
    </div>
  );
}
