import { Main } from "./page";
// import "./App.css";
import { useAppSelector } from "./store";
import Preview from "./components/Preview";
import { selectIsPreviewOpen } from "./store/Reducers/previewSlice";

function App() {
  const isPreviewOpen = useAppSelector(selectIsPreviewOpen);

  return (
    <>
      {isPreviewOpen && <Preview />}
      <Main />
    </>
  );
}

export default App;
