import { useDispatch, useSelector } from "react-redux";
import { CONFIRMATION_MODAL_CLOSE_TYPES } from "../../../utils/globalConstantUtil";
import { switchClientAccountStatusToServer } from "../../client/clientSlice";
import { deleteUserToServer } from "../../user/userSlice";
import { showNotification } from "../headerSlice";

function ConfirmationModalBody({ extraObject, closeModal }) {
  const dispatch = useDispatch();

  const { message, type, id } = extraObject;

  const proceedWithYes = async () => {
    const stringifyValues = JSON.stringify(id);
    if (type === CONFIRMATION_MODAL_CLOSE_TYPES.USER_DELETE) {
      let response;
      response = await dispatch(deleteUserToServer(stringifyValues));

      if (response?.error) {
        dispatch(
          showNotification({
            message: "Error while deleting the user",
            status: 0,
          }),
        );
      } else {
        dispatch(
          showNotification({
            message: "User successfully deleted",
            status: 1,
          }),
        );
        closeModal();
      }
    } else if (type === CONFIRMATION_MODAL_CLOSE_TYPES.CLIENT_DELETE) {
      let response;
      response = await dispatch(
        switchClientAccountStatusToServer(stringifyValues),
      );

      if (response?.error) {
        dispatch(
          showNotification({
            message: "Error while deleting the client",
            status: 0,
          }),
        );
      } else {
        dispatch(
          showNotification({
            message: "Client successfully deleted",
            status: 1,
          }),
        );
        closeModal();
      }
    }
    // closeModal();
  };

  return (
    <>
      <p className=" text-xl mt-8 text-center">{message}</p>

      <div className="modal-action mt-12">
        <button className="btn btn-outline" onClick={() => closeModal()}>
          Cancel
        </button>

        <button
          className="btn btn-primary w-36"
          onClick={() => proceedWithYes()}
        >
          Yes
        </button>
      </div>
    </>
  );
}

export default ConfirmationModalBody;
