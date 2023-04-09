import { FormProvider, useForm } from "react-hook-form";
import LabelInput from "./components/LabelInput";
import "./App.css";

function App() {
  const method = useForm();

  return (
    <div className="App">
      <FormProvider {...method}>
        <div className="flex items-center gap-3">
          <label htmlFor="id">이름</label>
          <input className="p-2" {...method.register("name")} />
        </div>
      </FormProvider>

      <div className="mt-4">{method.watch("name")}</div>
    </div>
  );
}

export default App;
