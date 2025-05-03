import { useAppDispatch, useAppSelector } from "../store";
import { selectJob } from "../store/Reducers/previewSlice";
import { closePreview } from "../store/Reducers/previewSlice";

const Preview: React.FC = () => {
  const jobItem = useAppSelector(selectJob);
  const dispatch = useAppDispatch();
  return (
    <div
      // className="side-panel float-right p-5 border-l-2 h-screen overflow-y-auto fixed top-0 right-0"
      className="text-gray-700 max-w-[35%] fixed top-0 right-0 w-1/3 h-screen p-4 border-l overflow-y-auto bg-white transition-transform duration-300"
      id="sidePanel"
    >
      <button
        className="fixed rounded-2xl mr-4 top-0 right-0"
        onClick={() => dispatch(closePreview())}
      >
        X
      </button>
      <h2 id="panelTitle" className="" text-xl font-bold mb-2>
        {jobItem?.title} at {jobItem?.company}
      </h2>
      <h4 id="panelSub" className="text-blue-500">
        {jobItem?.site}:{" "}
        <a href={jobItem?.job_url} target="_blank">
          View Job
        </a>
      </h4>
      <p
        id="panelDescription"
        className="text-gray-700 mb-4 whitespace-pre-wrap"
      >
        {jobItem?.description}
      </p>
    </div>
  );
};

export default Preview;
