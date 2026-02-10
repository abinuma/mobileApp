import React from "react";

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmitHandler = async(e) => {
        try {
            
        } catch (error) {
            
        }
    }
  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-3 min-w-72">
            <p>Email Adress</p>
            <input onChange={(e)=> setEmail(e.target.value)} value={email}
              className="rounded-md w-full px-3 py-2 border-gray-300 outline-none"
              type="email"
              placeholder="your@email.com"
            />
          </div>
          <div className="mb-3 min-w-72">
            <p>Password</p>
            <input onChange={(e)=> setPassword(e.target.value)} value={password}
              className="rounded-md w-full px-3 py-2 border-gray-300 outline-none"
              type="password"
              placeholder="Enter your password"
            />
          </div>
          <button className="mt-2 w-full py-2 px-4 rounded-md text-white bg-black" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;


/*e.target = the <form> element itself that fiers the event
e.target[0] = the first input element in the form (email input).e.target.email = finds the input that has name="email" (like a property lookup).value = reads whatever the user typed (what the DOM currently holds),so this e.target.email.value,e.target.password.value used to get values of uncontrolled form inputs.So this only works if you add the name attribute:like name="email" and name="password" to the respective input fields.
e.preventDefault() is used to prevent the default behavior of the form submission, which is to reload the page.usually event object is passed to any event handeler function as a first argument.
*/