//. <a href="https://github.com/fantasyland/fantasy-land"><img alt="Fantasy Land" src="https://raw.githubusercontent.com/fantasyland/fantasy-land/master/logo.png" width="75" height="75" align="left"></a>
//.
//. # sanctuary-list
//.
//. TK.

(f => {

  'use strict';

  const util = {inspect: {}};

  /* istanbul ignore else */
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = f (require ('util'),
                        require ('sanctuary-show'),
                        require ('sanctuary-type-classes'));
  } else if (typeof define === 'function' && define.amd != null) {
    define (['sanctuary-show', 'sanctuary-type-classes'],
            (show, Z) => f (util, show, Z));
  } else {
    self.sanctuaryList = f (util,
                            self.sanctuaryShow,
                            self.sanctuaryTypeClasses);
  }

}) ((util, show, Z) => {

  'use strict';

  const FL = require ('../../fantasyland/fantasy-land');

  /* istanbul ignore if */
  if (typeof __doctest !== 'undefined') {
    const {create, env} = __doctest.require ('sanctuary');
    // eslint-disable-next-line no-var
    var $ = __doctest.require ('sanctuary-def');
    const type = __doctest.require ('sanctuary-type-identifiers');
    const List = $.UnaryType
      ('List')
      ('')
      ([])
      (x => type (x) === listTypeIdent)
      (list => list);
    // eslint-disable-next-line no-var
    var S = create ({
      checkTypes: false,
      env: Z.concat (env, [List ($.Unknown)]),
    });
  }

  //  reverse :: List a -> List a
  const reverse = list => {
    let result = Nil;
    for (let l = list; l.isCons; l = l.tail) result = Cons (l.head) (result);
    return result;
  };

  //  concat :: List a -> List a -> List a
  const concat = list => other => {
    let result = other;
    for (let l = reverse (list); l.isCons; l = l.tail) {
      result = Cons (l.head) (result);
    }
    return result;
  };

  const listTypeIdent = 'sanctuary-list/List@1';

  const List = {};

  const prototype = {
    '@@type': listTypeIdent,
    '@@show': List$prototype$show,
  };

  {
    const {custom} = util.inspect;  // added in Node.js v6.6.0
    /* istanbul ignore else */
    if (typeof custom === 'symbol') {
      prototype[custom] = List$prototype$show;
    }
    /* istanbul ignore if */
    if (typeof Deno !== 'undefined') {
      if (Deno != null && typeof Deno.customInspect === 'symbol') {
        prototype[Deno.customInspect] = List$prototype$show;
      }
    }
  }

  //. `List a` satisfies the following [Fantasy Land][] specifications:
  //.
  //. ```javascript
  //. > const Useless = require ('sanctuary-useless')
  //.
  //. > S.map (k => k + ' '.repeat (16 - k.length) +
  //. .             (Z[k].test (Cons (Useless) (Nil)) ? '\u2705   ' :
  //. .              Z[k].test (Nil)                  ? '\u2705 * ' :
  //. .              /* otherwise */                    '\u274C   '))
  //. .       (S.keys (S.unchecked.filter (S.is ($.TypeClass)) (Z)))
  //. [ 'Setoid          ✅ * ',  // if ‘a’ satisfies Setoid
  //. . 'Ord             ✅ * ',  // if ‘a’ satisfies Ord
  //. . 'Semigroupoid    ❌   ',
  //. . 'Category        ❌   ',
  //. . 'Semigroup       ✅   ',
  //. . 'Monoid          ✅   ',
  //. . 'Group           ❌   ',
  //. . 'Filterable      ✅   ',
  //. . 'Functor         ✅   ',
  //. . 'Bifunctor       ❌   ',
  //. . 'Profunctor      ❌   ',
  //. . 'Apply           ✅   ',
  //. . 'Applicative     ✅   ',
  //. . 'Chain           ✅   ',
  //. . 'ChainRec        ✅   ',
  //. . 'Monad           ✅   ',
  //. . 'Alt             ✅   ',
  //. . 'Plus            ✅   ',
  //. . 'Alternative     ✅   ',
  //. . 'Foldable        ✅   ',
  //. . 'Traversable     ✅   ',
  //. . 'Extend          ✅   ',
  //. . 'Comonad         ❌   ',
  //. . 'Contravariant   ❌   ' ]
  //. ```

  const typeRep = $1 => {
    const tr = {};
    if (FL.isSetoid ($1)) {
      tr.equals = rhs => lhs => {
        let l = lhs;
        let r = rhs;
        while (l.isCons && r.isCons && FL.equals (r.head) (l.head)) {
          l = l.tail;
          r = r.tail;
        }
        return l.isNil && r.isNil;
      };
    }
    if (FL.isOrd ($1)) {
      tr.lte = rhs => lhs => {
        let l = lhs;
        let r = rhs;
        while (l.isCons && r.isCons && FL.equals (r.head) (l.head)) {
          l = l.tail;
          r = r.tail;
        }
        return l.isNil || r.isCons && FL.lte (r.head) (l.head);
      };
    }
    tr.concat = concat;
    tr.filter = pred => xs => {
      let result = Nil;
      for (let l = reverse (xs); l.isCons; l = l.tail) {
        if (pred (l.head)) result = Cons (l.head) (result);
      }
      return result;
    };
    tr.map = f => xs => {
      let result = Nil;
      for (let l = reverse (xs); l.isCons; l = l.tail) {
        result = Cons (f (l.head)) (result);
      }
      return result;
    };
    tr.ap = fs => xs => {
      let result = Nil;
      const reversed = reverse (xs);
      for (let r = reverse (fs); r.isCons; r = r.tail) {
        for (let l = reversed; l.isCons; l = l.tail) {
          result = Cons (r.head (l.head)) (result);
        }
      }
      return result;
    };
    return tr;
  };

  //  _Nil :: TypeRep a -> List a
  const _Nil = tr => {
    const Nil = Object.create (prototype);
    Nil.isNil = true;
    Nil.isCons = false;
    Nil['fantasy-land'] = typeRep (tr);
    return Nil;
  };

  //# List.Nil :: List a
  //.
  //. The empty value of type `List a`.
  //.
  //. ```javascript
  //. > Nil
  //. Nil
  //. ```
  const Nil = List.Nil = _Nil ({
    equals: () => {},
    lte: () => {},
    concat: () => {},
  });

  //# List.Cons :: a -> List a -> List a
  //.
  //. Constructs a value of type `List a` from a head of type `a` and a tail
  //. of type `List a`.
  //.
  //. ```javascript
  //. > Cons (1) (Cons (2) (Cons (3) (Nil)))
  //. Cons (1) (Cons (2) (Cons (3) (Nil)))
  //. ```
  const Cons = List.Cons = head => {
    const tr = typeRep (FL.typeRep (head));
    return tail => {
      const list = Object.create (prototype);
      if (Z.Setoid.test (head)) {
        list['fantasy-land/equals'] = List$prototype$equals;
        if (Z.Ord.test (head)) {
          list['fantasy-land/lte'] = List$prototype$lte;
        }
      }
      list['fantasy-land'] = tr;
      list.isNil = false;
      list.isCons = true;
      list.head = head;
      list.tail = tail.isNil ? _Nil (tr) : tail;
      return list;
    };
  };

  //# List.fantasy-land/empty :: () -> List a
  //.
  //.   - `empty (List)` is equivalent to `Nil`
  //.
  //. ```javascript
  //. > S.empty (List)
  //. Nil
  //. ```
  List['fantasy-land/empty'] = () => Nil;

  //# List.fantasy-land/of :: a -> List a
  //.
  //.   - `of (List) (x)` is equivalent to `Cons (x) (Nil)`
  //.
  //. ```javascript
  //. > S.of (List) (42)
  //. Cons (42) (Nil)
  //. ```
  List['fantasy-land/of'] = List$of;
  function List$of(x) { return Cons (x) (Nil); }

  const next = x => ({tag: next, value: x});
  const done = x => ({tag: done, value: x});

  //# List.fantasy-land/chainRec :: ((a -> c, b -> c, a) -> List c, a) -> List b
  //.
  //. ```javascript
  //. > Z.chainRec (
  //. .   List,
  //. .   (next, done, s) =>
  //. .     s.length === 2 ?
  //. .     S.map (done) (Cons (s + '!') (Cons (s + '?') (Nil))) :
  //. .     S.map (next) (Cons (s + 'o') (Cons (s + 'n') (Nil))),
  //. .   ''
  //. . )
  //. Cons ('oo!')
  //. .    (Cons ('oo?')
  //. .          (Cons ('on!')
  //. .                (Cons ('on?')
  //. .                      (Cons ('no!')
  //. .                            (Cons ('no?')
  //. .                                  (Cons ('nn!')
  //. .                                        (Cons ('nn?')
  //. .                                              (Nil))))))))
  //. ```
  List['fantasy-land/chainRec'] = (f, x) => {
    let result = Nil;
    let todo = Cons (x) (Nil);
    while (todo.isCons) {
      const {head} = todo;
      todo = todo.tail;
      let more = Nil;
      for (let l = f (next, done, head); l.isCons; l = l.tail) {
        if (l.head.tag === done) {
          more = Cons (l.head.value) (more);
        } else {
          todo = Cons (l.head.value) (todo);
        }
      }
      while (more.isCons) {
        result = Cons (more.head) (result);
        more = more.tail;
      }
    }
    return result;
  };

  //# List.fantasy-land/zero :: () -> List a
  //.
  //.   - `zero (List)` is equivalent to `Nil`
  //.
  //. ```javascript
  //. > S.zero (List)
  //. Nil
  //. ```
  List['fantasy-land/zero'] = () => Nil;

  //# List#@@show :: Showable a => List a ~> () -> String
  //.
  //.   - `show (Nil)` is equivalent to `'Nil'`
  //.   - `show (Cons (head) (tail))` is equivalent to
  //.     `'Cons (' + show (head) + ') (' + show (tail) + ')'`
  //.
  //. ```javascript
  //. > S.show (Nil)
  //. 'Nil'
  //.
  //. > S.show (Cons ('foo') (Cons ('bar') (Cons ('baz') (Nil))))
  //. 'Cons ("foo") (Cons ("bar") (Cons ("baz") (Nil)))'
  //. ```
  function List$prototype$show() {
    let opening = '';
    let closing = '';
    for (let list = this; list.isCons; list = list.tail) {
      opening += 'Cons (' + show (list.head) + ') (';
      closing += ')';
    }
    return opening + 'Nil' + closing;
  }

  //# List#fantasy-land/equals :: Setoid a => List a ~> List a -> Boolean
  //.
  //.   - `Nil` is exclusively equal to `Nil`
  //.   - `Cons (h1) (t1)` is equal to `Cons (h2) (t2)` [iff][] `h1` is equal
  //.     to `h2` and `t1` is equal to `t2` according to [`Z.equals`][]
  //.
  //. ```javascript
  //. > S.equals (Nil) (Nil)
  //. true
  //.
  //. > S.equals (Cons (1) (Cons (2) (Nil))) (Cons (1) (Cons (2) (Nil)))
  //. true
  //.
  //. > S.equals (Cons (1) (Cons (2) (Nil))) (Cons (2) (Cons (1) (Nil)))
  //. false
  //.
  //. > S.equals (Cons (1) (Cons (2) (Nil))) (Nil)
  //. false
  //. ```
  function List$prototype$equals(other) {
    let l = this;
    let r = other;
    while (l.isCons && r.isCons && Z.equals (l.head, r.head)) {
      l = l.tail;
      r = r.tail;
    }
    return l.isNil && r.isNil;
  }

  //# List#fantasy-land/lte :: Ord a => List a ~> List a -> Boolean
  //.
  //.   - `Nil` is (less than or) equal to `Nil`
  //.   - `Nil` is less than `Cons (head) (tail)`
  //.   - `Cons (h1) (t1)` is less than or equal to `Cons (h2) (t2)` [iff][]
  //.     `h1` is less than `h2` according to [`Z.lt`][] or
  //.     `h1` is equal to `h2` according to [`Z.equals`][] and
  //.     `t1` is less than or equal to `t2` according to [`Z.lte`][]
  //.
  //. ```javascript
  //. > S.lte (Cons (3) (Cons (2) (Cons (1) (Nil))))
  //. .       (Cons (3) (Cons (2) (Nil)))
  //. true
  //.
  //. > S.lte (Cons (3) (Cons (2) (Cons (1) (Nil))))
  //. .       (Cons (3) (Cons (2) (Cons (1) (Nil))))
  //. true
  //.
  //. > S.lte (Cons (3) (Cons (2) (Cons (1) (Nil))))
  //. .       (Cons (3) (Cons (2) (Cons (1) (Cons (0) (Nil)))))
  //. false
  //.
  //. > S.lte (Cons (3) (Cons (2) (Cons (1) (Nil))))
  //. .       (Cons (4) (Cons (2) (Cons (1) (Nil))))
  //. false
  //. ```
  function List$prototype$lte(other) {
    let l = this;
    let r = other;
    while (l.isCons && r.isCons && Z.equals (l.head, r.head)) {
      l = l.tail;
      r = r.tail;
    }
    return l.isNil || r.isCons && Z.lte (l.head, r.head);
  }

  //# List#fantasy-land/concat :: List a ~> List a -> List a
  //.
  //. TK.
  //.
  //. ```javascript
  //. > S.concat (Nil) (Nil)
  //. Nil
  //.
  //. > S.concat (Cons (1) (Cons (2) (Cons (3) (Nil))))
  //. .          (Cons (4) (Cons (5) (Cons (6) (Nil))))
  //. Cons (1) (Cons (2) (Cons (3) (Cons (4) (Cons (5) (Cons (6) (Nil))))))
  //. ```
  function List$prototype$concat(other) {
    return concat (this) (other);
  }

  //# List#fantasy-land/filter :: List a ~> (a -> Boolean) -> List a
  //.
  //.   - `filter (p) (Nil)` is equivalent to `Nil`
  //.   - `filter (p) (Cons (h) (t))` is equivalent to
  //.     `p (h) ? Cons (h) (filter (p) (t)) : filter (p) (t)`
  //.
  //. ```javascript
  //. > S.filter (S.odd) (Nil)
  //. Nil
  //.
  //. > S.filter (S.odd) (Cons (1) (Cons (2) (Cons (3) (Nil))))
  //. Cons (1) (Cons (3) (Nil))
  //. ```
  function List$prototype$filter(pred) {
    let result = Nil;
    for (let l = reverse (this); l.isCons; l = l.tail) {
      if (pred (l.head)) result = Cons (l.head) (result);
    }
    return result;
  }

  //# List#fantasy-land/map :: List a ~> (a -> b) -> List b
  //.
  //.   - `map (f) (Nil)` is equivalent to `Nil`
  //.   - `map (f) (Cons (h) (t))` is equivalent to
  //.     `Cons (f (h)) (map (f) (t))`
  //.
  //. ```javascript
  //. > S.map (Math.sqrt) (Nil)
  //. Nil
  //.
  //. > S.map (Math.sqrt) (Cons (16) (Cons (25) (Cons (36) (Nil))))
  //. Cons (4) (Cons (5) (Cons (6) (Nil)))
  //. ```
  function List$prototype$map(f) {
    let result = Nil;
    for (let l = reverse (this); l.isCons; l = l.tail) {
      result = Cons (f (l.head)) (result);
    }
    return result;
  }

  //# List#fantasy-land/ap :: List a ~> List (a -> b) -> List b
  //.
  //. TK.
  //.
  //. ```javascript
  //. > S.ap (Nil) (Nil)
  //. Nil
  //.
  //. > S.ap (Cons (S.sub (1)) (Nil))
  //. .      (Cons (10) (Cons (20) (Cons (30) (Nil))))
  //. Cons (9) (Cons (19) (Cons (29) (Nil)))
  //.
  //. > S.ap (Cons (S.sub (1)) (Cons (S.add (1)) (Nil)))
  //. .      (Cons (5) (Cons (15) (Cons (25) (Nil))))
  //. Cons (4) (Cons (14) (Cons (24) (Cons (6) (Cons (16) (Cons (26) (Nil))))))
  //. ```
  function List$prototype$ap(fs) {
    let result = Nil;
    const reversed = reverse (this);
    for (let r = reverse (fs); r.isCons; r = r.tail) {
      for (let l = reversed; l.isCons; l = l.tail) {
        result = Cons (r.head (l.head)) (result);
      }
    }
    return result;
  }

  //# List#fantasy-land/chain :: List a ~> (a -> List b) -> List b
  //.
  //.   - `chain (f) (Nil)` is equivalent to `Nil`
  //.   - `chain (f) (Cons (h) (t))` is equivalent to
  //.     `concat (f (h)) (chain (f) (t))`
  //.
  //. ```javascript
  //. > const duplicate = x => Cons (x) (Cons (x) (Nil))
  //.
  //. > S.chain (duplicate) (Nil)
  //. Nil
  //.
  //. > S.chain (duplicate) (Cons (1) (Cons (2) (Cons (3) (Nil))))
  //. Cons (1) (Cons (1) (Cons (2) (Cons (2) (Cons (3) (Cons (3) (Nil))))))
  //. ```
  function List$prototype$chain(f) {
    let result = Nil;
    for (let l = reverse (this); l.isCons; l = l.tail) {
      result = concat (f (l.head)) (result);
    }
    return result;
  }

  //# List#fantasy-land/alt :: List a ~> List a -> List a
  //.
  //. TK.
  //.
  //. ```javascript
  //. > S.alt (Nil) (Nil)
  //. Nil
  //.
  //. > S.alt (Cons (1) (Cons (2) (Cons (3) (Nil))))
  //. .       (Cons (4) (Cons (5) (Cons (6) (Nil))))
  //. Cons (1) (Cons (2) (Cons (3) (Cons (4) (Cons (5) (Cons (6) (Nil))))))
  //. ```
  function List$prototype$alt(other) {
    return concat (this) (other);
  }

  //# List#fantasy-land/reduce :: List a ~> ((b, a) -> b, b) -> b
  //.
  //.   - `reduce (f) (x) (Nil)` is equivalent to `x`
  //.   - `reduce (f) (x) (Cons (h) (t))` is equivalent to
  //.     `reduce (f) (f (x) (h)) (t)`
  //.
  //. ```javascript
  //. > S.reduce (S.concat) ('') (Nil)
  //. ''
  //.
  //. > S.reduce (S.concat) ('') (Cons ('x') (Cons ('y') (Cons ('z') (Nil))))
  //. 'xyz'
  //. ```
  function List$prototype$reduce(f, x) {
    let result = x;
    for (let l = this; l.isCons; l = l.tail) result = f (result, l.head);
    return result;
  }

  //# List#fantasy-land/traverse :: Applicative f => List a ~> (TypeRep f, a -> f b) -> f (List b)
  //.
  //. TK.
  //.
  //. ```javascript
  //. > S.traverse (Array) (S.words) (Nil)
  //. [Nil]
  //.
  //. > S.traverse (Array) (S.words) (Cons ('a b c') (Cons ('x y z') (Nil)))
  //. [ Cons ('a') (Cons ('x') (Nil)),
  //. . Cons ('a') (Cons ('y') (Nil)),
  //. . Cons ('a') (Cons ('z') (Nil)),
  //. . Cons ('b') (Cons ('x') (Nil)),
  //. . Cons ('b') (Cons ('y') (Nil)),
  //. . Cons ('b') (Cons ('z') (Nil)),
  //. . Cons ('c') (Cons ('x') (Nil)),
  //. . Cons ('c') (Cons ('y') (Nil)),
  //. . Cons ('c') (Cons ('z') (Nil)) ]
  //. ```
  function List$prototype$traverse(typeRep, f) {
    let result = Z.of (typeRep, Nil);
    for (let l = this; l.isCons; l = l.tail) {
      result = Z.lift2 (concat, result, Z.map (List$of, f (l.head)));
    }
    return result;
  }

  //# List#fantasy-land/extend :: List a ~> (List a -> b) -> List b
  //.
  //.   - `extend (f) (Nothing)` is equivalent to `Nothing`
  //.   - `extend (f) (Just (x))` is equivalent to `Just (f (Just (x)))`
  //.
  //. ```javascript
  //. > S.extend (S.reduce (S.pow) (1)) (Nil)
  //. Nil
  //.
  //. > S.extend (S.reduce (S.pow) (1)) (Cons (2) (Cons (3) (Cons (4) (Nil))))
  //. Cons (262144)             // 4 ** 3 ** 2 ** 1
  //. .    (Cons (64)           // 4 ** 3 ** 1
  //. .          (Cons (4)      // 4 ** 1
  //. .                (Nil)))
  //. ```
  function List$prototype$extend(f) {
    let list = Nil;
    for (let l = this; l.isCons; l = l.tail) list = Cons (f (l)) (list);
    return reverse (list);
  }

  return List;

});

//. [Fantasy Land]:             v:fantasyland/fantasy-land
//. [`Z.equals`]:               v:sanctuary-js/sanctuary-type-classes#equals
//. [`Z.lt`]:                   v:sanctuary-js/sanctuary-type-classes#lt
//. [`Z.lte`]:                  v:sanctuary-js/sanctuary-type-classes#lte
//. [iff]:                      https://en.wikipedia.org/wiki/If_and_only_if
//. [type representative]:      v:fantasyland/fantasy-land#type-representatives
