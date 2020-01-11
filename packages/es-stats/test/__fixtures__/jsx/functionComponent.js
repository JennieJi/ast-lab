function ParentFunctionComponent(props) {
  return <div>{JSON.stringify(props)}</div>;
}

export function ChildFunctionComponentNoProps(props) {
  return <ParentFunctionComponent />;
}

export function ChildFunctionComponentHasProps1(props) {
  return (
    <ParentFunctionComponent testProp  {...props}/>
  );
}

export function ChildFunctionComponentHasProps2(props) {
  return (
    <ParentFunctionComponent testProp  {...props}>
      some text
    </ParentFunctionComponent>
  );
}


const ParentFunctionComponentObj = {
  a: ParentFunctionComponent
};

export function ChildFunctionComponentJSXMemberExpression(props) {
  return <ParentFunctionComponentObj.a />;
}