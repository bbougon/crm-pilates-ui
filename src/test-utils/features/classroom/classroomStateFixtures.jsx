export function LoadingState() {
  this.state = {
    classrooms: [],
    status: "loading",
    error: null,
  };

  this.build = () => {
    return this.state;
  };
}
