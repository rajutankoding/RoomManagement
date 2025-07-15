"use client";

import React from "react";

const ModalComponent = ({
  modalId,
  buttonText = "Open Modal",
  modalTitle = "Modal Component",
  modalSize = "max-w-5xl",
  children,
}) => {
  return (
    <>
      <button
        className="btn btn-primary btn-block"
        onClick={() => document.getElementById(modalId).showModal()}>
        {buttonText}
      </button>

      <dialog id={modalId} className="modal">
        <div className={`modal-box w-11/12 ${modalSize}`}>
          <h3 className="font-bold text-lg">{modalTitle}</h3>
          <a className="font-serif">Customer Name</a>
          <div className="py-4">{children}</div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default ModalComponent;
