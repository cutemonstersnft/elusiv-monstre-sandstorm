import { useRef } from "react";
import { products } from "../lib/products"
import NumberInput from "./NumberInput";

interface Props {
  submitTarget: string;
  enabled: boolean;
}

export default function Products({ submitTarget, enabled }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form method='get' action={submitTarget} ref={formRef}>
      <div className="flex justify-center max-w-4xl m-auto"> 
<div className="max-w-sm bg-white border border-gray-200 rounded-xl shadow-md dark:bg-gray-800 dark:border-gray-700">
  
    <a href="#">
        <img className="rounded-t-lg" src="/elusiv.png" alt="elusiv" />
    </a>
    <div className="p-5">
    {products.map(product => {
            return (
              <div className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white" key={product.id}>
                <h3 className="text-2xl font-bold">{product.name}</h3>
                <p className="text-sm text-gray-800">{product.description}</p>
                <div className="my-2">
                  <label>Amount:</label></div>
                <div>
                  <NumberInput name={product.id} formRef={formRef} />
                  <div className="my-2">
                  <label>Key:</label></div>
                  <input className="w-40 border-2 border-gray-200 bg-gray-800 rounded-md flex flex-row items-center" type="text" id="password" name="password" />
                </div>
              </div>
            )
          })}
        <button
          className= "py-2 text-white mt-4 bg-blue-700 rounded-md w-40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Checkout
        </button>
    </div>
    
</div>

    </div>

    </form>
  )
}
