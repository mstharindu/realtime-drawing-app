import './styles.css';

export const Computer = () => {
  return (
    <div className="computer-container">
      <select className="computer-select">
        <option value="option1">Create and change color</option>
      </select>
      <button className="computer-submit">Execute</button>
    </div>
  );
};
