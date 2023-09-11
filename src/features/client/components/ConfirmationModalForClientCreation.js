import { useDispatch, useSelector } from "react-redux";
import { CONFIRMATION_MODAL_CLOSE_TYPES } from "../../../utils/globalConstantUtil";
import { switchClientAccountStatusToServer } from "../clientSlice";
import { deleteUserToServer } from "../../user/userSlice";
import { showNotification } from "../../common/headerSlice";

function ConfirmationModalForClientCreation({ extraObject }) {
  const dispatch = useDispatch();

  const { message, proceedFunction, cancelFunction } = extraObject;

  return (
    <>
      <p className=" text-xl mt-8 text-center">{message}</p>

      <div className="modal-action mt-12">
        <button
          className="btn btn-outline"
          // onClick={() => proceedFunction()}
        >
          Cancel
        </button>

        <button
          className="btn btn-primary w-36"
          // onClick={() => cancelFunction()}
        >
          Yes
        </button>
      </div>
    </>
  );
}

export default ConfirmationModalForClientCreation;
