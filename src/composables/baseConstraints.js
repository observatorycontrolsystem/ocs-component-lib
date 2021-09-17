export default function baseConstraints(context) {
  const update = () => {
    context.emit('constraints-update');
  };

  return { update };
}
