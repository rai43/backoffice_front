import { useDispatch, useSelector } from 'react-redux';

function ConfirmationModalForClientCreation({ extraObject }) {
  const dispatch = useDispatch();

  const { message } = extraObject;

  return (
    <>
      <p className=" text-xl mt-8 text-center">{message}</p>

      <div className="modal-action mt-12">
        <button className="btn btn-outline">Cancel</button>

        <button className="btn btn-primary w-36">Yes</button>
      </div>
    </>
  );
}

export default ConfirmationModalForClientCreation;
