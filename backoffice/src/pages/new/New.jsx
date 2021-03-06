import Navbar from '../../components/navbar/Navbar';
import Sidebar from '../../components/sidebar/Sidebar';
import './new.scss';
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined';
import { useEffect, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore"; 
import { auth, db, storage } from '../../firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from 'react-router-dom';


const New = ({inputs,title}) => {
  const [file, setFile] = useState("");
  const [data, setData] = useState({});
  const [perc, setPerc] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    const uploadFile = ()=> {

      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

uploadTask.on('state_changed', 
  (snapshot) => {

    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    setPerc(progress)
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
        default:
          break;
    }
  }, 
  (error) => {
    console.log(error)
  }, 
  () => {

    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      setData((prev)=>({...prev, img:downloadURL}))
    });
  }
);
    };
    file && uploadFile();
  },[file])
  
console.log(data)

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;

    setData({ ...data, [id]: value });
  };

  
  const handleAdd = async(e) => {
    e.preventDefault();
  
    try {

     const res = await createUserWithEmailAndPassword(auth,data.email,data.password);
     
     await setDoc(doc(db, "users", res.user.uid), {
      ...data,
       timeStamp: serverTimestamp(),
      });
      navigate(-1)
    }catch (err) {
  console.log(err)
    }
  }
    
  return (
    <div className="new">
      <Sidebar />
      <div className="newCotainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        
        <div className="bottom">
          
      <div className="left">
        <img src={file ? URL.createObjectURL(file) : "https://imgs.search.brave.com/sa5OfyBRlSGBtf8iUX42YmKMVNm0yBpNEwAgvfQcefQ/rs:fit:1000:1000:1/g:ce/aHR0cHM6Ly90aGFp/Z2lmdHMub3IudGgv/d3AtY29udGVudC91/cGxvYWRzLzIwMTcv/MDMvbm8taW1hZ2Uu/anBn"} alt="no image"  />
      </div>
      
      <div className="right">
        <form onSubmit={handleAdd}>
        <div className="formInput">
        <label htmlFor="file">Upload an Image:<DriveFolderUploadOutlinedIcon className="icon" /></label>
        <input type="file" id="file" onChange={e=>setFile(e.target.files[0])}  style={{display:"none"}}/>
      </div>

      {inputs.map((input) => (
      <div className="formInput" key={input.id}>
        <label>{input.label}</label>
        <input type={input.type}  id={input.id} placeholder={input.placeholder} onChange={handleInput} />
      </div>
        ))}
      <button disabled={perc !== null && perc < 100} type="submit">Send</button>  
      
        </form>
      </div>

        </div>
        
      </div>
    </div>
  )
}
        

       

export default New
