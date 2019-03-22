'use strict';

const assert        = require ('assert');

const FL            = require ('../../../fantasyland/fantasy-land');
const laws          = require ('fantasy-laws');
const jsc           = require ('jsverify');
const Identity      = require ('sanctuary-identity');
const show          = require ('sanctuary-show');
const Z             = require ('sanctuary-type-classes');
const type          = require ('sanctuary-type-identifiers');
const Useless       = require ('sanctuary-useless');

const List          = require ('..');


const {Nil, Cons}   = List;


//    ListArb :: Arbitrary a -> Arbitrary (List a)
const ListArb = arb => (jsc.array (arb)).smap (xs =>
  Z.reduce ((list, x) => Cons (x) (list), Nil, xs)
);

//    testLaws :: Object -> Object -> Undefined
const testLaws = laws => arbs => {
  (Object.keys (laws)).forEach (name => {
    eq (laws[name].length) (arbs[name].length);
    test (name.replace (/[A-Z]/g, c => ' ' + c.toLowerCase ()),
          laws[name] (...arbs[name]));
  });
};

//    eq :: a -> b -> Undefined !
function eq(actual) {
  assert.strictEqual (arguments.length, eq.length);
  return function eq$1(expected) {
    assert.strictEqual (arguments.length, eq$1.length);
    assert.strictEqual (show (actual), show (expected));
    assert.strictEqual (FL.equals (actual) (expected), true);
  };
}


suite ('List', () => {

  test ('metadata', () => {
    eq (typeof Nil) ('object');
    eq (typeof Cons) ('function');
    eq (Cons.length) (1);
  });

  test ('tags', () => {
    const cons = Cons (0) (Nil);
    eq (Nil.isNil) (true);
    eq (Nil.isCons) (false);
    eq (cons.isNil) (false);
    eq (cons.isCons) (true);
  });

  test ('@@type', () => {
    eq (type (Nil)) ('sanctuary-list/List@1');
    eq (type (Cons (0) (Nil))) ('sanctuary-list/List@1');
    eq (type.parse (type (Cons (0) (Nil))))
       ({namespace: 'sanctuary-list', name: 'List', version: 1});
  });

  test ('@@show', () => {
    eq (show (Nil)) ('Nil');
    eq (show (Cons (1) (Nil))) ('Cons (1) (Nil)');
    eq (show (Cons (1) (Cons (2) (Nil)))) ('Cons (1) (Cons (2) (Nil))');
    eq (show (Cons (1) (Cons (2) (Cons (3) (Nil))))) ('Cons (1) (Cons (2) (Cons (3) (Nil)))');
    eq (show (Cons ('foo') (Nil))) ('Cons ("foo") (Nil)');
    eq (show (Cons ('foo') (Cons ('bar') (Nil)))) ('Cons ("foo") (Cons ("bar") (Nil))');
    eq (show (Cons ('foo') (Cons ('bar') (Cons ('baz') (Nil))))) ('Cons ("foo") (Cons ("bar") (Cons ("baz") (Nil)))');
  });

});

suite ('type-class predicates', () => {

  test ('Setoid', () => {
    eq (Z.Setoid.test (Nil)) (true);
    eq (Z.Setoid.test (Cons (Useless) (Nil))) (false);
    eq (Z.Setoid.test (Cons (/(?:)/) (Nil))) (true);
  });

  test ('Ord', () => {
    eq (Z.Ord.test (Nil)) (true);
    eq (Z.Ord.test (Cons (Useless) (Nil))) (false);
    eq (Z.Ord.test (Cons (/(?:)/) (Nil))) (false);
    eq (Z.Ord.test (Cons (0) (Nil))) (true);
  });

  test ('Semigroupoid', () => {
    eq (Z.Semigroupoid.test (Nil)) (false);
    eq (Z.Semigroupoid.test (Cons ([]) (Nil))) (false);
  });

  test ('Category', () => {
    eq (Z.Category.test (Nil)) (false);
    eq (Z.Category.test (Cons ([]) (Nil))) (false);
  });

  test ('Semigroup', () => {
    eq (Z.Semigroup.test (Nil)) (true);
    eq (Z.Semigroup.test (Cons (Useless) (Nil))) (true);
  });

  test ('Monoid', () => {
    eq (Z.Monoid.test (Nil)) (false);  // XXX
    eq (Z.Monoid.test (Cons (Useless) (Nil))) (false);
  });

  test ('Group', () => {
    eq (Z.Group.test (Nil)) (false);
    eq (Z.Group.test (Cons ([]) (Nil))) (false);
  });

  test ('Filterable', () => {
    eq (Z.Filterable.test (Nil)) (true);
    eq (Z.Filterable.test (Cons (Useless) (Nil))) (true);
  });

  test ('Functor', () => {
    eq (Z.Functor.test (Nil)) (true);
    eq (Z.Functor.test (Cons (Useless) (Nil))) (true);
  });

  test ('Bifunctor', () => {
    eq (Z.Bifunctor.test (Nil)) (false);
    eq (Z.Bifunctor.test (Cons ([]) (Nil))) (false);
  });

  test ('Profunctor', () => {
    eq (Z.Profunctor.test (Nil)) (false);
    eq (Z.Profunctor.test (Cons (Math.sqrt) (Nil))) (false);
  });

  test ('Apply', () => {
    eq (Z.Apply.test (Nil)) (true);
    eq (Z.Apply.test (Cons (Useless) (Nil))) (true);
  });

  test ('Applicative', () => {
    eq (Z.Applicative.test (Nil)) (false);  // XXX
    eq (Z.Applicative.test (Cons (Useless) (Nil))) (false);
  });

  test ('Chain', () => {
    eq (Z.Chain.test (Nil)) (false);  // XXX
    eq (Z.Chain.test (Cons (Useless) (Nil))) (false);
  });

  test ('ChainRec', () => {
    eq (Z.ChainRec.test (Nil)) (false);  // XXX
    eq (Z.ChainRec.test (Cons (Useless) (Nil))) (false);
  });

  test ('Monad', () => {
    eq (Z.Monad.test (Nil)) (false);  // XXX
    eq (Z.Monad.test (Cons (Useless) (Nil))) (false);
  });

  test ('Alt', () => {
    eq (Z.Alt.test (Nil)) (false);  // XXX
    eq (Z.Alt.test (Cons (Useless) (Nil))) (false);
  });

  test ('Plus', () => {
    eq (Z.Plus.test (Nil)) (false);  // XXX
    eq (Z.Plus.test (Cons (Useless) (Nil))) (false);
  });

  test ('Alternative', () => {
    eq (Z.Alternative.test (Nil)) (false);  // XXX
    eq (Z.Alternative.test (Cons (Useless) (Nil))) (false);
  });

  test ('Foldable', () => {
    eq (Z.Foldable.test (Nil)) (false);  // XXX
    eq (Z.Foldable.test (Cons (Useless) (Nil))) (false);
  });

  test ('Traversable', () => {
    eq (Z.Traversable.test (Nil)) (false);  // XXX
    eq (Z.Traversable.test (Cons (Useless) (Nil))) (false);
  });

  test ('Extend', () => {
    eq (Z.Extend.test (Nil)) (false);  // XXX
    eq (Z.Extend.test (Cons (Useless) (Nil))) (false);
  });

//  test ('Comonad', () => {
//    eq (Z.Comonad.test (Nothing)) (false);
//    eq (Z.Comonad.test (Just (Identity (0)))) (false);
//  });
//
//  test ('Contravariant', () => {
//    eq (Z.Contravariant.test (Nothing)) (false);
//    eq (Z.Contravariant.test (Just (Math.sqrt))) (false);
//  });

});

suite ('methods', () => {

  test ('fantasy-land/equals', () => {
    eq (FL.equals (Nil) (Nil)) (true);
    eq (FL.equals (Nil) (Cons (0) (Nil))) (false);
    eq (FL.equals (Cons (0) (Nil)) (Nil)) (false);
    eq (FL.equals (Cons (0) (Nil)) (Cons (0) (Nil))) (true);
    eq (FL.equals (Cons (0) (Nil)) (Cons (1) (Nil))) (false);
    eq (FL.equals (Cons (1) (Nil)) (Cons (0) (Nil))) (false);
    eq (FL.equals (Cons (1) (Cons (2) (Nil))) (Nil)) (false);
    eq (FL.equals (Cons (1) (Cons (2) (Nil))) (Cons (1) (Nil))) (false);
    eq (FL.equals (Cons (1) (Cons (2) (Nil))) (Cons (1) (Cons (2) (Nil)))) (true);
    eq (FL.equals (Cons (1) (Cons (2) (Nil))) (Cons (1) (Cons (2) (Cons (3) (Nil))))) (false);
    eq (FL.equals (Cons (['foo', 'bar', 'baz']) (Nil)) (Cons (['foo', 'bar', 'baz']) (Nil))) (true);
  });

  test ('fantasy-land/lte', () => {
    eq (FL.lte (Nil) (Nil)) (true);
    eq (FL.lte (Nil) (Cons (0) (Nil))) (false);
    eq (FL.lte (Cons (0) (Nil)) (Nil)) (true);
    eq (FL.lte (Cons (0) (Nil)) (Cons (0) (Nil))) (true);
    eq (FL.lte (Cons (0) (Nil)) (Cons (0) (Cons (1) (Nil)))) (false);
    eq (FL.lte (Cons (0) (Nil)) (Cons (1) (Nil))) (false);
    eq (FL.lte (Cons (1) (Nil)) (Cons (0) (Nil))) (true);
    eq (FL.lte (Cons (0) (Cons (1) (Nil))) (Nil)) (true);
    eq (FL.lte (Cons (0) (Cons (1) (Nil))) (Cons (0) (Nil))) (true);
    eq (FL.lte (Cons (0) (Cons (1) (Nil))) (Cons (1) (Nil))) (false);
    eq (FL.lte (Cons (['foo', 'bar', 'baz']) (Nil)) (Cons (['foo', 'bar', 'baz']) (Nil))) (true);
  });

  test ('fantasy-land/concat', () => {
    eq (Z.concat (Nil, Nil)) (Nil);
    eq (Z.concat (Nil, Cons (0) (Nil))) (Cons (0) (Nil));
    eq (Z.concat (Cons (0) (Nil), Nil)) (Cons (0) (Nil));
    eq (Z.concat (Nil, Cons (1) (Cons (2) (Cons (3) (Nil))))) (Cons (1) (Cons (2) (Cons (3) (Nil))));
    eq (Z.concat (Cons (1) (Nil), Cons (2) (Cons (3) (Nil)))) (Cons (1) (Cons (2) (Cons (3) (Nil))));
    eq (Z.concat (Cons (1) (Cons (2) (Nil)), Cons (3) (Nil))) (Cons (1) (Cons (2) (Cons (3) (Nil))));
    eq (Z.concat (Cons (1) (Cons (2) (Cons (3) (Nil))), Nil)) (Cons (1) (Cons (2) (Cons (3) (Nil))));
  });

  test ('fantasy-land/empty', () => {
    eq (Z.empty (List)) (Nil);
  });

  test ('fantasy-land/filter', () => {
    eq (Z.filter (n => n % 2 === 1, Nil)) (Nil);
    eq (Z.filter (n => n % 2 === 1, Cons (0) (Nil))) (Nil);
    eq (Z.filter (n => n % 2 === 1, Cons (1) (Nil))) (Cons (1) (Nil));
    eq (Z.filter (n => n % 2 === 1, Cons (1) (Cons (2) (Cons (3) (Cons (4) (Cons (5) (Nil))))))) (Cons (1) (Cons (3) (Cons (5) (Nil))));
  });

  test ('fantasy-land/map', () => {
    eq (Z.map (Math.sqrt, Nil)) (Nil);
    eq (Z.map (Math.sqrt, Cons (1) (Nil))) (Cons (1) (Nil));
    eq (Z.map (Math.sqrt, Cons (1) (Cons (4) (Nil)))) (Cons (1) (Cons (2) (Nil)));
    eq (Z.map (Math.sqrt, Cons (1) (Cons (4) (Cons (9) (Nil))))) (Cons (1) (Cons (2) (Cons (3) (Nil))));
  });

  test ('fantasy-land/ap', () => {
    eq (Z.ap (Nil, Nil)) (Nil);
    eq (Z.ap (Nil, Cons (10) (Nil))) (Nil);
    eq (Z.ap (Cons (n => n - 1) (Nil), Cons (10) (Nil))) (Cons (9) (Nil));
    eq (Z.ap (Cons (n => n - 1) (Nil), Cons (10) (Cons (20) (Nil)))) (Cons (9) (Cons (19) (Nil)));
    eq (Z.ap (Cons (n => n - 1) (Cons (n => n + 1) (Nil)), Cons (10) (Cons (20) (Nil)))) (Cons (9) (Cons (19) (Cons (11) (Cons (21) (Nil)))));
  });

  test ('fantasy-land/of', () => {
    eq (Z.of (List, 42)) (Cons (42) (Nil));
  });

  test ('fantasy-land/chain', () => {
    eq (Z.chain (x => Cons (x) (Cons (x) (Nil)), Nil)) (Nil);
    eq (Z.chain (x => Cons (x) (Cons (x) (Nil)), Cons (1) (Nil))) (Cons (1) (Cons (1) (Nil)));
    eq (Z.chain (x => Cons (x) (Cons (x) (Nil)), Cons (1) (Cons (2) (Nil)))) (Cons (1) (Cons (1) (Cons (2) (Cons (2) (Nil)))));
    eq (Z.chain (x => Cons (x) (Cons (x) (Nil)), Cons (1) (Cons (2) (Cons (3) (Nil))))) (Cons (1) (Cons (1) (Cons (2) (Cons (2) (Cons (3) (Cons (3) (Nil)))))));
  });

  test ('fantasy-land/chainRec', () => {
    eq (Z.chainRec (List,
                    (next, done, s) => s.length === 2 ?
                                       Z.map (done, Cons (s + '!') (Cons (s + '?') (Nil))) :
                                       Z.map (next, Cons (s + 'o') (Cons (s + 'n') (Nil))),
                    ''))
       (Cons ('oo!') (Cons ('oo?') (Cons ('on!') (Cons ('on?') (Cons ('no!') (Cons ('no?') (Cons ('nn!') (Cons ('nn?') (Nil)))))))));
  });

  test ('fantasy-land/alt', () => {
    eq (Z.alt (Nil, Nil)) (Nil);
    eq (Z.alt (Nil, Cons (0) (Nil))) (Cons (0) (Nil));
    eq (Z.alt (Cons (0) (Nil), Nil)) (Cons (0) (Nil));
    eq (Z.alt (Nil, Cons (1) (Cons (2) (Cons (3) (Nil))))) (Cons (1) (Cons (2) (Cons (3) (Nil))));
    eq (Z.alt (Cons (1) (Nil), Cons (2) (Cons (3) (Nil)))) (Cons (1) (Cons (2) (Cons (3) (Nil))));
    eq (Z.alt (Cons (1) (Cons (2) (Nil)), Cons (3) (Nil))) (Cons (1) (Cons (2) (Cons (3) (Nil))));
    eq (Z.alt (Cons (1) (Cons (2) (Cons (3) (Nil))), Nil)) (Cons (1) (Cons (2) (Cons (3) (Nil))));
  });

  test ('fantasy-land/zero', () => {
    eq (Z.zero (List)) (Nil);
  });

  test ('fantasy-land/reduce', () => {
    eq (Z.reduce ((x, y) => x + y, '.', Nil)) ('.');
    eq (Z.reduce ((x, y) => x + y, '.', Cons ('foo') (Nil))) ('.foo');
    eq (Z.reduce ((x, y) => x + y, '.', Cons ('foo') (Cons ('bar') (Nil)))) ('.foobar');
    eq (Z.reduce ((x, y) => x + y, '.', Cons ('foo') (Cons ('bar') (Cons ('baz') (Nil))))) ('.foobarbaz');
  });

  test ('fantasy-land/traverse', () => {
    eq (Z.traverse (Identity, x => Identity (x + 1), Cons (10) (Cons (20) (Cons (30) (Nil)))))
       (Identity (Cons (11) (Cons (21) (Cons (31) (Nil)))));
    eq (Z.traverse (Array, x => [x, x], Cons (1) (Cons (2) (Cons (3) (Nil)))))
       ([Cons (1) (Cons (2) (Cons (3) (Nil))),
         Cons (1) (Cons (2) (Cons (3) (Nil))),
         Cons (1) (Cons (2) (Cons (3) (Nil))),
         Cons (1) (Cons (2) (Cons (3) (Nil))),
         Cons (1) (Cons (2) (Cons (3) (Nil))),
         Cons (1) (Cons (2) (Cons (3) (Nil))),
         Cons (1) (Cons (2) (Cons (3) (Nil))),
         Cons (1) (Cons (2) (Cons (3) (Nil)))]);
  });

  test ('fantasy-land/extend', () => {
    const join = xs => Z.reduce ((s, x) => s + (s && '-') + x, '', xs);
    eq (Z.extend (join, Cons ('foo') (Cons ('bar') (Cons ('baz') (Nil)))))
       (Cons ('foo-bar-baz') (Cons ('bar-baz') (Cons ('baz') (Nil))));
  });

});

suite ('Setoid laws', () => {
  testLaws (laws.Setoid) ({
    reflexivity: [
      ListArb (jsc.falsy),
    ],
    symmetry: [
      ListArb (jsc.bool),
      ListArb (jsc.bool),
    ],
    transitivity: [
      ListArb (jsc.bool),
      ListArb (jsc.bool),
      ListArb (jsc.bool),
    ],
  });
});

suite ('Ord laws', () => {
  testLaws (laws.Ord) ({
    totality: [
      ListArb (jsc.string),
      ListArb (jsc.string),
    ],
    antisymmetry: [
      ListArb (jsc.string),
      ListArb (jsc.string),
    ],
    transitivity: [
      ListArb (jsc.string),
      ListArb (jsc.string),
      ListArb (jsc.string),
    ],
  });
});

suite ('Semigroup laws', () => {
  testLaws (laws.Semigroup (Z.equals)) ({
    associativity: [
      ListArb (jsc.string),
      ListArb (jsc.string),
      ListArb (jsc.string),
    ],
  });
});

suite ('Monoid laws', () => {
  testLaws (laws.Monoid (Z.equals, List)) ({
    leftIdentity: [
      ListArb (jsc.string),
    ],
    rightIdentity: [
      ListArb (jsc.string),
    ],
  });
});

suite ('Filterable laws', () => {
  testLaws (laws.Filterable (Z.equals)) ({
    distributivity: [
      ListArb (jsc.number),
      jsc.constant (x => x > -10),
      jsc.constant (x => x < 10),
    ],
    identity: [
      ListArb (jsc.number),
    ],
    annihilation: [
      ListArb (jsc.number),
      ListArb (jsc.number),
    ],
  });
});

suite ('Functor laws', () => {
  testLaws (laws.Functor (Z.equals)) ({
    identity: [
      ListArb (jsc.number),
    ],
    composition: [
      ListArb (jsc.number),
      jsc.constant (Math.sqrt),
      jsc.constant (Math.abs),
    ],
  });
});

suite ('Apply laws', () => {
  testLaws (laws.Apply (Z.equals)) ({
    composition: [
      ListArb (jsc.constant (Math.sqrt)),
      ListArb (jsc.constant (Math.abs)),
      ListArb (jsc.number),
    ],
  });
});

suite ('Applicative laws', () => {
  testLaws (laws.Applicative (Z.equals, List)) ({
    identity: [
      ListArb (jsc.number),
    ],
    homomorphism: [
      jsc.constant (Math.abs),
      jsc.number,
    ],
    interchange: [
      ListArb (jsc.constant (Math.abs)),
      jsc.number,
    ],
  });
});

// suite ('Chain laws', () => {
//   testLaws (laws.Chain (Z.equals)) ({
//     associativity: [
//       ListArb (jsc.array (jsc.asciistring)),
//       jsc.constant (head),
//       jsc.constant (parseFloat_),
//     ],
//   });
// });

// suite ('ChainRec laws', () => {
//   testLaws (laws.ChainRec (Z.equals, List)) ({
//     equivalence: [
//       jsc.constant (x => x >= 1000),
//       jsc.constant (x => x <= 1 ? Nothing : Just (x * x)),
//       jsc.constant (Just),
//       jsc.integer,
//     ],
//   });
// });

// suite ('Monad laws', () => {
//   testLaws (laws.Monad (Z.equals, List)) ({
//     leftIdentity: [
//       jsc.constant (head),
//       jsc.array (jsc.number),
//     ],
//     rightIdentity: [
//       ListArb (jsc.number),
//     ],
//   });
// });

suite ('Alt laws', () => {
  testLaws (laws.Alt (Z.equals)) ({
    associativity: [
      ListArb (jsc.number),
      ListArb (jsc.number),
      ListArb (jsc.number),
    ],
    distributivity: [
      ListArb (jsc.number),
      ListArb (jsc.number),
      jsc.constant (Math.sqrt),
    ],
  });
});

suite ('Plus laws', () => {
  testLaws (laws.Plus (Z.equals, List)) ({
    leftIdentity: [
      ListArb (jsc.number),
    ],
    rightIdentity: [
      ListArb (jsc.number),
    ],
    annihilation: [
      jsc.constant (Math.sqrt),
    ],
  });
});

suite ('Alternative laws', () => {
  testLaws (laws.Alternative (Z.equals, List)) ({
    distributivity: [
      ListArb (jsc.number),
      ListArb (jsc.constant (Math.sqrt)),
      ListArb (jsc.constant (Math.abs)),
    ],
    annihilation: [
      ListArb (jsc.number),
    ],
  });
});

suite ('Foldable laws', () => {
  testLaws (laws.Foldable (Z.equals)) ({
    associativity: [
      jsc.constant ((x, y) => x + y),
      jsc.number,
      ListArb (jsc.number),
    ],
  });
});

// suite ('Traversable laws', () => {
//   testLaws (laws.Traversable (Z.equals)) ({
//     naturality: [
//       jsc.constant (Either),
//       jsc.constant (List),
//       jsc.constant (eitherToMaybe),
//       ListArb (EitherArb (jsc.string) (jsc.number)),
//     ],
//     identity: [
//       jsc.constant (Identity),
//       ListArb (jsc.number),
//     ],
//     composition: [
//       jsc.constant (Identity),
//       jsc.constant (List),
//       ListArb (IdentityArb (ListArb (jsc.number))),
//     ],
//   });
// });

suite ('Extend laws', () => {
  testLaws (laws.Extend (Z.equals)) ({
    associativity: [
      ListArb (jsc.integer),
      jsc.constant (maybe => Z.reduce ((x, y) => x + y, 1, maybe)),
      jsc.constant (maybe => Z.reduce ((x, y) => y * y, 1, maybe)),
    ],
  });
});
