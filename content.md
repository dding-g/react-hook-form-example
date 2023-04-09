[##_Image|kage@b1bHB8/btr8NDWTWcz/mS8f4nD8XJETFcN4cSlms0/img.png|CDM|1.3|{"originWidth":2400,"originHeight":1260,"style":"alignCenter"}_##]

이번에 서비스를 새로 리뉴얼하면서 Jquery에서 Next.js 기반으로 서비스를 새로 구성했다.

서비스 특성상 사용자가 작성하는 Form과 데이터를 보여주는게 핵심적인 기능인데, 안정적인 서비스와 관리를 위해 필수적으로 사용해야하는 오픈소스중 하나가 React Hook Form 이였는데, 어떤식으로 사용했는지, 사용하는데 불편한점이나 처음부터 알았으면 좋았을 것 같은 부분들을 중심으로 이야기를 풀어가려한다.

## React Hook Form 이란?

React에서 전반적인 Form Input 관리를 위해 DX, UX, 퍼포먼스 중심으로 설계된 오픈소스.
여러개의 input을 복합적으로 사용하거나 복잡한 Input validation을 처리할 때 특히 유용하게 사용할 수 있다.

## 어떤식으로 사용하나요?

React Hook Form은 최상단의 FormProvider 를 중심으로 동작한다.

아래 예시처럼 [`FormProvider`](https://react-hook-form.com/api/formprovider/)선언 후 [`reigster`](https://react-hook-form.com/api/useform/register/)로 input을 초기화 시켜준다.

```tsx
import { FormProvider, useForm } from "react-hook-form";
import LabelInput from "./components/LabelInput";
import "./App.css";

function App() {
  const method = useForm();

  const onSubmitHandler = (data) => {
    console.log(data); // form data
  };

  return (
    <div className="App">
      <FormProvider {...method}>
        <form onSubmit={method.handleSubmit(onSubmitHandler)}>
          <div className="flex items-center gap-3">
            <label htmlFor="id">이름</label>
            <input className="p-2" {...method.register("name")} />
          </div>
        </form>
      </FormProvider>

      <div className="mt-4">{method.watch("name")}</div>
    </div>
  );
}

export default App;
```

`FormProvider`로 감싼 자식 컴포넌트에서는 context의 개념으로 데이터를 가져와서 쳐리할 수 있다.

```tsx
const Child1 = () => {
  // useFormContext로 FormProvider에서 register를 받아 input 등록
  const { register } = useFormContext();

  return <input {...register("child1")} />;
};

const Child2 = () => {
  // 다른 Input watch 가능
  const { watch } = useFormContext();

  return <div>{watch("child1")}</div>;
};

const Parent = () => {
  const method = useForm();

  return (
    <FormProvider {...method}>
      <Child1 />
      <Child2 />
    </FormProvider>
  );
};
```

### register

`register`는 `onChange, onBlur, name, ref` 를 반환하고 각각을 override 할 수 있는데, 이중 `ref`를 override하는 방식이 조금은 특이하다.
`onChange, onBlur`는 register를 초기화시킬때 option으로 초기화 시킬 항목을 정해주면 되지만,

```tsx
const App = () => {
  const regist = register("example1", {
    onChange: (e) => {
      // override onChange
    },
    onBlur: (e) => {
      // override onBlur
    },
  });

  return <input {...regist} />;
};
```

ref는 option에서 override 시킬 수 있는 항목은 따로 없고, 아래와 같은 방식으로 진행한다.

```tsx
const inputRef = useRef(null);
const { register } = useFormContext();

const { ref, ...regist } = register("fileInput", {
  require: {
    // for validation
    value: true,
    message: "필수로 입력해주세요",
  },
  onChange: (e) => {
    // override onChange
  },
  onBlur: (e) => {
    // override onBlur
  },
});

return (
  <>
    <input
      {...regist}
      ref={(e) => {
        ref(e);
        inputRef.current = e;
      }}
    />
  </>
);
```

필자는 customFileInput을 만들기 위해 ref를 override시키는게 필요했는데, 한가지 문제점이 있었다.

react-hook-form은 input에 설정한 validation이 통과되지 않은채로 form이 submit 될 때,
에러가 발생한 input으로 focus시켜주는 [`shouldFocusError`](https://react-hook-form.com/api/useform/#shouldFocusError)의 default value가 `true`이다.

그런데 위 방식으로 ref를 override시킨 input만 해당 기능이 동작하지 않는 현상이 생겼다.
그래서 focus용 input을 하나 더 만들어서 해당 input에 ref를 넣어서 해결하려 했지만 ref를 사용해서 파일 데이터를 가져와야하기 때문에 해결책이 될 수 없었고, 다른 방법을 모색하는 중이다.

### validation

React hook form은 input validation을 처리할 수 있도록 도와준다.

```tsx
const { register } = useFormContext();

return (
  <input
    {...register("name", {
      require: {
        // for validation
        value: true,
        message: "필수로 입력해주세요",
      },
    })}
  />
);
```

React Hook Form을 도입하게 된 가장 큰 이유가 input validation이였는데, 많은 input의 validation을 종단에서 처리하려고 했을때는 에로사항이 많았다.
